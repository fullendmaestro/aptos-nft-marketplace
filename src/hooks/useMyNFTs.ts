import { useState, useEffect } from "react"
import { AuctionData, NFTWithDetails, OfferData } from "../types"
import {
  fetchNFTDetails,
  fetchUserAuctionNFTs,
  fetchIncomingOffers,
  client,
} from "../utils/aptosUtils"
import { marketplaceAddr } from "../constants"

export const useMyNFTs = (address?: string) => {
  const [ownedNFTs, setOwnedNFTs] = useState<NFTWithDetails[]>([])
  const [auctionNFTs, setAuctionNFTs] = useState<AuctionData[]>([])
  console.log("this is the auction nfts", auctionNFTs)
  const [offerNFTs, setOfferNFTs] = useState<OfferData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNFTs = async () => {
    if (!address) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Fetch all NFTs owned by the user
      const marketplace = await client.getAccountResource(
        marketplaceAddr,
        `${marketplaceAddr}::NFTMarketplace::Marketplace`,
      )

      const allNFTs = (marketplace.data as any).nfts
      const userNFTs = allNFTs.filter((nft: any) => nft.owner === address)

      // Fetch auction NFTs
      const auctionNFTs = await fetchUserAuctionNFTs(address)
      setAuctionNFTs(auctionNFTs)

      // Fetch NFTs with offers
      const offerNFTs = await fetchIncomingOffers(address)
      setOfferNFTs(offerNFTs)

      // Get NFTs that are not in auction or have offers
      const auctionIds = new Set(auctionNFTs.map(nft => nft.id))
      const offerIds = new Set(offerNFTs.map(nft => nft.id))

      const availableNFTs = await Promise.all(
        userNFTs
          .filter(
            (nft: any) => !auctionIds.has(nft.id) && !offerIds.has(nft.id),
          )
          .map(async (nft: any) => {
            const details = await fetchNFTDetails(nft.id.toString())
            return {
              ...details,
              status: "available" as const,
            }
          }),
      )

      setOwnedNFTs(availableNFTs)
      setError(null)
    } catch (err) {
      console.error("Error fetching NFTs:", err)
      setError("Failed to fetch NFTs")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchNFTs()
  }, [address])

  return {
    ownedNFTs,
    auctionNFTs,
    offerNFTs,
    loading,
    error,
    refetch: () => {
      if (address) {
        setLoading(true)
        fetchNFTs()
      }
    },
  }
}
