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
import { marketplaceAddr, moduleName, tesnetaddr } from "@/constants"

export const client = new AptosClient(tesnetaddr)

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
      `${marketplaceAddr}::${moduleName}::Marketplace`,
    )
    const allNFTs = (response.data as any).nfts
    const listedNFTs = (response.data as { listed_nfts: ListedNFT[] })
      .listed_nfts

    const nftDetails = await Promise.all(
      allNFTs.map(async (nft: any) => {
        const listedNFT = listedNFTs.find(listed => listed.nft_id === nft.id)
        return {
          id: nft.id,
          owner: nft.owner,
          name: new TextDecoder().decode(hexToUint8Array(nft.name)),
          description: new TextDecoder().decode(
            hexToUint8Array(nft.description),
          ),
          uri: new TextDecoder().decode(hexToUint8Array(nft.uri)),
          price: listedNFT ? listedNFT.price / 100000000 : 0,
          for_sale: !!listedNFT,
          rarity: nft.rarity,
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
    function: `${marketplaceAddr}::${moduleName}::get_nft_details`,
    arguments: [marketplaceAddr, nft_id],
    type_arguments: [],
  })

  const [id, owner, name, description, uri, rarity] = response

  return {
    id: Number(id),
    owner: owner.toString(),
    name: hexToString(name.toString()),
    description: hexToString(description.toString()),
    uri: hexToString(uri.toString()),
    rarity: Number(rarity),
  }
}

export const fetchAuctionDetails = async (
  nft_id: string,
): Promise<Auction | any> => {
  try {
    const response = await client.view({
      function: `${marketplaceAddr}::${moduleName}::get_auction_details`,
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
      function: `${marketplaceAddr}::${moduleName}::get_offer_details`,
      arguments: [marketplaceAddr, nft_id, buyer],
      type_arguments: [],
    })

    const [price, expirationTime, isActive] = response

    return {
      nft_id: parseInt(nft_id),
      buyer,
      price: Number(price),
      expiration_time: Number(expirationTime),
      is_active: Boolean(isActive),
    }
  } catch (error) {
    // Return null if no offer exists
    return null
  }
}

export const fetchAvailableNFTs = async (): Promise<NFTWithDetails[]> => {
  const response = await client.view({
    function: `${marketplaceAddr}::${moduleName}::get_available_nfts`,
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

export const fetchListedNFTs = async (): Promise<ListedNFT[]> => {
  try {
    const response = await client.view({
      function: `${marketplaceAddr}::${moduleName}::get_listed_nfts`,
      type_arguments: [],
      arguments: [marketplaceAddr],
    })
    const nftIds = response[0] as string[]
    const listedNFTs = await Promise.all(
      nftIds.map(async id => {
        const nft = await fetchNFTDetails(id)
        const price = await getNFTPrice(id)
        return {
          ...nft,
          price,
          for_sale: true,
        }
      }),
    )
    return listedNFTs
  } catch (error) {
    console.error("Error fetching listed NFTs:", error)
    throw error
  }
}

export const fetchUserNFTs = async (userAddress: string): Promise<NFT[]> => {
  try {
    const response = await client.view({
      function: `${marketplaceAddr}::${moduleName}::get_user_available_nfts`,
      type_arguments: [],
      arguments: [marketplaceAddr, userAddress],
    })

    const nftIds = response[0] as string[]
    const nfts = await Promise.all(
      nftIds.map(async id => {
        const nft = await fetchNFTDetails(id)
        return nft
      }),
    )

    return nfts
  } catch (error) {
    console.error("Error fetching user NFTs:", error)
    throw error
  }
}

export const fetchAuctions = async (
  selectedRarity?: number,
): Promise<AuctionData[]> => {
  try {
    const response = await client.getAccountResource(
      marketplaceAddr,
      `${marketplaceAddr}::${moduleName}::Marketplace`,
    )
    const auctions = (response.data as any).auctions as Auction[]
    const activeAuctions = auctions.filter(auction => auction.is_active)

    const auctionDetails = await Promise.all(
      activeAuctions.map(async auction => {
        const nft = await fetchNFTDetails(auction.nft_id.toString())
        return {
          ...nft,
          status: "in_auction" as const,
          auction: {
            ...auction,
            current_bid: auction.current_bid / 100000000,
            start_price: auction.start_price / 100000000,
          },
        }
      }),
    )

    return selectedRarity
      ? auctionDetails.filter(auction => auction.rarity === selectedRarity)
      : auctionDetails
  } catch (error) {
    console.error("Error fetching auctions:", error)
    throw error
  }
}

export const fetchUserAuctions = async (
  userAddress: string,
): Promise<AuctionData[]> => {
  try {
    const response = await client.view({
      function: `${marketplaceAddr}::${moduleName}::get_user_auction_nfts`,
      arguments: [marketplaceAddr, userAddress],
      type_arguments: [],
    })

    const nftIds = response[0] as string[]
    const auctionDetails = await Promise.all(
      nftIds.map(async id => {
        const [nft, auction] = await Promise.all([
          fetchNFTDetails(id),
          fetchAuctionDetails(id),
        ])
        return {
          ...nft,
          status: "in_auction" as const,
          auction: {
            ...auction,
            current_bid: auction.current_bid / 100000000,
            start_price: auction.start_price / 100000000,
          },
        }
      }),
    )

    return auctionDetails
  } catch (error) {
    console.error("Error fetching user auctions:", error)
    throw error
  }
}

export const fetchOffers = async (
  selectedRarity?: number,
): Promise<OfferData[]> => {
  try {
    const response = await client.getAccountResource(
      marketplaceAddr,
      `${marketplaceAddr}::${moduleName}::Marketplace`,
    )
    const offers = (response.data as any).offers as Offer[]
    const activeOffers = offers.filter(offer => offer.is_active)

    const offerDetails = await Promise.all(
      activeOffers.map(async offer => {
        const nft = await fetchNFTDetails(offer.nft_id.toString())
        return {
          ...nft,
          status: "has_offers" as const,
          offers: [offer],
        }
      }),
    )

    return selectedRarity
      ? offerDetails.filter(offer => offer.rarity === selectedRarity)
      : offerDetails
  } catch (error) {
    console.error("Error fetching offers:", error)
    throw error
  }
}

export const fetchUserAuctionNFTs = async (
  userAddress: string,
): Promise<AuctionData[]> => {
  const response = await client.view({
    function: `${marketplaceAddr}::${moduleName}::get_user_auction_nfts`,
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
    function: `${marketplaceAddr}::${moduleName}::get_incoming_offers`,
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
    `${marketplaceAddr}::${moduleName}::Marketplace`,
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
    function: `${marketplaceAddr}::${moduleName}::mint_nft`,
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
    function: `${marketplaceAddr}::${moduleName}::create_auction`,
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
    function: `${marketplaceAddr}::${moduleName}::place_bid`,
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
    function: `${marketplaceAddr}::${moduleName}::end_auction`,
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
    function: `${marketplaceAddr}::${moduleName}::create_offer`,
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
    function: `${marketplaceAddr}::${moduleName}::accept_offer`,
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
    function: `${marketplaceAddr}::${moduleName}::cancel_offer`,
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
    function: `${marketplaceAddr}::${moduleName}::transfer_ownership`,
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
    function: `${marketplaceAddr}::${moduleName}::purchase_nft`,
    type_arguments: [],
    arguments: [marketplaceAddr, selectedNft.id.toString()],
  }

  const response = await (window as any).aptos.signAndSubmitTransaction(
    entryFunctionPayload,
  )
  await client.waitForTransaction(response.hash)
  return response.hash
}

export const isNFTForSale = async (nftId: string): Promise<boolean> => {
  try {
    const response = await client.view({
      function: `${marketplaceAddr}::${moduleName}::is_nft_for_sale`,
      arguments: [marketplaceAddr, nftId],
      type_arguments: [],
    })
    return response[0] as boolean
  } catch (error) {
    console.error("Error checking if NFT is for sale:", error)
    return false
  }
}

export const getNFTPrice = async (nftId: string): Promise<number> => {
  try {
    const response = await client.view({
      function: `${marketplaceAddr}::${moduleName}::get_nft_price`,
      arguments: [marketplaceAddr, nftId],
      type_arguments: [],
    })
    return (response[0] as number) / 100000000
  } catch (error) {
    console.error("Error getting NFT price:", error)
    return 0
  }
}

export const fetchOutgoingOffers = async (
  userAddress: string,
): Promise<NFT[]> => {
  const response = await client.view({
    function: `${marketplaceAddr}::${moduleName}::get_outgoing_offers`,
    arguments: [marketplaceAddr, userAddress],
    type_arguments: [],
  })

  console.log("returned outgoing offers >>>>", response)

  const nftIds = response[0] as string[]
  const nfts = await Promise.all(
    nftIds.map(async id => {
      const nft = await fetchNFTDetails(id)
      const offerDetail = await fetchOfferDetails(id, userAddress)
      return {
        ...nft,
        offer: {
          ...offerDetail,
        },
      }
    }),
  )

  return nfts
}
