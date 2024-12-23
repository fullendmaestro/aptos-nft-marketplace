// src\utils\aptosUtils.ts
import { AptosClient, Types } from "aptos"
import {
  NFT,
  NFTWithDetails,
  Auction,
  Offer,
  ListedNFT,
  AuctionData,
  OfferData,
} from "../types"
import { marketplaceAddr } from "@/constants"

export const client = new AptosClient(
  "https://fullnode.devnet.aptoslabs.com/v1",
)

export const hexToString = (hex: string): string => {
  const bytes = hexToUint8Array(hex.slice(2))
  return new TextDecoder().decode(bytes)
}

export const hexToUint8Array = (hexString: string): Uint8Array => {
  const bytes = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16)
  }
  return bytes
}

export const fetchNFTs = async (selectedRarity?: number): Promise<NFT[]> => {
  try {
    const response = await client.getAccountResource(
      marketplaceAddr,
      `${marketplaceAddr}::NFTMarketplace::Marketplace`,
    )
    const listedNFTs = (response.data as { listed_nfts: ListedNFT[] })
      .listed_nfts

    const nftDetails = await Promise.all(
      listedNFTs.map(async listedNFT => {
        const nftDetailResponse = await client.view({
          function: `${marketplaceAddr}::NFTMarketplace::get_nft_details`,
          arguments: [marketplaceAddr, listedNFT.id.toString()],
          type_arguments: [],
        })

        const [nftId, owner, name, description, uri, rarity] =
          nftDetailResponse as [number, string, string, string, string, number]

        return {
          id: nftId,
          owner,
          name: new TextDecoder().decode(hexToUint8Array(name.slice(2))),
          description: new TextDecoder().decode(
            hexToUint8Array(description.slice(2)),
          ),
          uri: new TextDecoder().decode(hexToUint8Array(uri.slice(2))),
          price: listedNFT.price / 100000000,
          for_sale: true,
          rarity,
        }
      }),
    )

    return nftDetails.filter(
      nft => selectedRarity === undefined || nft.rarity === selectedRarity,
    )
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    throw error
  }
}

export const fetchNFTDetails = async (nft_id: string): Promise<NFT> => {
  const response = await client.view({
    function: `${marketplaceAddr}::NFTMarketplace::get_nft_details`,
    arguments: [marketplaceAddr, nft_id],
    type_arguments: [],
  })

  const [id, owner, name, description, uri, rarity] = response

  return {
    id,
    owner,
    name: hexToString(name),
    description: hexToString(description),
    uri: hexToString(uri),
    rarity,
  }
}

export const fetchAuctionDetails = async (nft_id: string): Promise<Auction> => {
  try {
    const response = await client.view({
      function: `${marketplaceAddr}::NFTMarketplace::get_auction_details`,
      arguments: [marketplaceAddr, nft_id],
      type_arguments: [],
    })

    const [seller, startPrice, currentBid, highestBidder, endTime, isActive] =
      response

    return {
      nft_id: parseInt(nft_id),
      seller,
      start_price: startPrice,
      current_bid: currentBid,
      highest_bidder: highestBidder,
      end_time: endTime,
      is_active: isActive,
    }
  } catch (error) {
    // Return null if no auction exists
    return null
  }
}

export const fetchOfferDetails = async (
  nft_id: string,
  buyer: string,
): Promise<Offer | null> => {
  try {
    const response = await client.view({
      function: `${marketplaceAddr}::NFTMarketplace::get_offer_details`,
      arguments: [marketplaceAddr, nft_id, buyer],
      type_arguments: [],
    })

    const [price, expirationTime, isActive] = response

    return {
      nft_id: parseInt(nft_id),
      buyer,
      price,
      expiration_time: expirationTime,
      is_active: isActive,
    }
  } catch (error) {
    // Return null if no offer exists
    return null
  }
}

export const fetchAvailableNFTs = async (): Promise<NFTWithDetails[]> => {
  const response = await client.view({
    function: `${marketplaceAddr}::NFTMarketplace::get_available_nfts`,
    arguments: [marketplaceAddr],
    type_arguments: [],
  })

  const nftIds = response[0] as string[]
  const nfts = await Promise.all(
    nftIds.map(async id => {
      const nft = await fetchNFTDetails(id)
      return {
        ...nft,
        status: "available" as const,
      }
    }),
  )

  return nfts
}

export const fetchUserAuctionNFTs = async (
  userAddress: string,
): Promise<AuctionData[]> => {
  const response = await client.view({
    function: `${marketplaceAddr}::NFTMarketplace::get_user_auction_nfts`,
    arguments: [marketplaceAddr, userAddress],
    type_arguments: [],
  })

  const nftIds = response[0] as string[]
  const nfts = await Promise.all(
    nftIds.map(async id => {
      const [nft, auction] = await Promise.all([
        fetchNFTDetails(id),
        fetchAuctionDetails(id),
      ])
      return {
        ...nft,
        status: "in_auction" as const,
        auction: auction,
      }
    }),
  )

  return nfts
}

export const fetchIncomingOffers = async (
  userAddress: string,
): Promise<OfferData[]> => {
  const response = await client.view({
    function: `${marketplaceAddr}::NFTMarketplace::get_incoming_offers`,
    arguments: [marketplaceAddr, userAddress],
    type_arguments: [],
  })

  const nftIds = response[0] as string[]
  const nfts = await Promise.all(
    nftIds.map(async id => {
      const nft = await fetchNFTDetails(id)
      const offers = await fetchNFTOffers(id)
      return {
        ...nft,
        status: "has_offers" as const,
        offers,
      }
    }),
  )

  return nfts
}

export const fetchNFTOffers = async (nft_id: string): Promise<Offer[]> => {
  const marketplace = await client.getAccountResource(
    marketplaceAddr,
    `${marketplaceAddr}::NFTMarketplace::Marketplace`,
  )

  const offers = (marketplace.data as any).offers as Offer[]
  return offers.filter(
    offer => offer.nft_id.toString() === nft_id && offer.is_active,
  )
}

// Transaction functions
export const mintNFT = async (
  name: string,
  description: string,
  uri: string,
  rarity: number,
): Promise<string> => {
  const nameBytes = Array.from(new TextEncoder().encode(name))
  const descriptionBytes = Array.from(new TextEncoder().encode(description))
  const uriBytes = Array.from(new TextEncoder().encode(uri))

  const payload: Types.TransactionPayload = {
    type: "entry_function_payload",
    function: `${marketplaceAddr}::NFTMarketplace::mint_nft`,
    type_arguments: [],
    arguments: [marketplaceAddr, nameBytes, descriptionBytes, uriBytes, rarity],
  }

  const response = await (window as any).aptos.signAndSubmitTransaction(payload)
  await client.waitForTransaction(response.hash)
  return response.hash
}

export const createAuction = async (
  nft_id: number,
  start_price: number,
  duration: number,
): Promise<string> => {
  const payload: Types.TransactionPayload = {
    type: "entry_function_payload",
    function: `${marketplaceAddr}::NFTMarketplace::create_auction`,
    type_arguments: [],
    arguments: [
      marketplaceAddr,
      nft_id,
      (start_price * 100000000).toString(),
      duration.toString(),
    ],
  }

  const response = await (window as any).aptos.signAndSubmitTransaction(payload)
  await client.waitForTransaction(response.hash)
  return response.hash
}

export const placeBid = async (
  nft_id: number,
  bid_amount: number,
): Promise<string> => {
  const payload: Types.TransactionPayload = {
    type: "entry_function_payload",
    function: `${marketplaceAddr}::NFTMarketplace::place_bid`,
    type_arguments: [],
    arguments: [marketplaceAddr, nft_id, (bid_amount * 100000000).toString()],
  }

  const response = await (window as any).aptos.signAndSubmitTransaction(payload)
  await client.waitForTransaction(response.hash)
  return response.hash
}

export const endAuction = async (nft_id: number): Promise<string> => {
  const payload: Types.TransactionPayload = {
    type: "entry_function_payload",
    function: `${marketplaceAddr}::NFTMarketplace::end_auction`,
    type_arguments: [],
    arguments: [marketplaceAddr, nft_id],
  }

  const response = await (window as any).aptos.signAndSubmitTransaction(payload)
  await client.waitForTransaction(response.hash)
  return response.hash
}

export const createOffer = async (
  nft_id: number,
  price: number,
  duration: number,
): Promise<string> => {
  const payload: Types.TransactionPayload = {
    type: "entry_function_payload",
    function: `${marketplaceAddr}::NFTMarketplace::create_offer`,
    type_arguments: [],
    arguments: [
      marketplaceAddr,
      nft_id,
      (price * 100000000).toString(),
      duration.toString(),
    ],
  }

  const response = await (window as any).aptos.signAndSubmitTransaction(payload)
  await client.waitForTransaction(response.hash)
  return response.hash
}

export const acceptOffer = async (
  nft_id: number,
  buyer: string,
): Promise<string> => {
  const payload: Types.TransactionPayload = {
    type: "entry_function_payload",
    function: `${marketplaceAddr}::NFTMarketplace::accept_offer`,
    type_arguments: [],
    arguments: [marketplaceAddr, nft_id, buyer],
  }

  const response = await (window as any).aptos.signAndSubmitTransaction(payload)
  await client.waitForTransaction(response.hash)
  return response.hash
}

export const cancelOffer = async (nft_id: number): Promise<string> => {
  const payload: Types.TransactionPayload = {
    type: "entry_function_payload",
    function: `${marketplaceAddr}::NFTMarketplace::cancel_offer`,
    type_arguments: [],
    arguments: [marketplaceAddr, nft_id],
  }

  const response = await (window as any).aptos.signAndSubmitTransaction(payload)
  await client.waitForTransaction(response.hash)
  return response.hash
}

export const transferNFT = async (
  nft_id: number,
  recipient: string,
): Promise<string> => {
  const payload: Types.TransactionPayload = {
    type: "entry_function_payload",
    function: `${marketplaceAddr}::NFTMarketplace::transfer_ownership`,
    type_arguments: [],
    arguments: [marketplaceAddr, nft_id, recipient],
  }

  const response = await (window as any).aptos.signAndSubmitTransaction(payload)
  await client.waitForTransaction(response.hash)
  return response.hash
}

export const purchaseNFT = async (selectedNft: ListedNFT): Promise<string> => {
  const priceInOctas = selectedNft.price * 100000000

  const entryFunctionPayload = {
    type: "entry_function_payload",
    function: `${marketplaceAddr}::NFTMarketplace::purchase_nft`,
    type_arguments: [],
    arguments: [marketplaceAddr, selectedNft.id.toString()],
  }

  const response = await (window as any).aptos.signAndSubmitTransaction(
    entryFunctionPayload,
  )
  await client.waitForTransaction(response.hash)
  return response.hash
}
