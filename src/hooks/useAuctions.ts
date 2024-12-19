import { useState, useEffect } from "react"
import { NFTWithDetails } from "../types"
import {
  fetchAuctionDetails,
  fetchNFTDetails,
  client,
} from "../utils/aptosUtils"
import { marketplaceAddr } from "@/constants"

export const useAuctions = (rarity?: number) => {
  const [auctions, setAuctions] = useState<NFTWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuctions = async () => {
    try {
      setLoading(true)
      const marketplace = await client.getAccountResource(
        marketplaceAddr,
        `${marketplaceAddr}::NFTMarketplace::Marketplace`,
      )

      const allAuctions = (marketplace.data as any).auctions
      const activeAuctions = allAuctions.filter((a: any) => a.is_active)

      const auctionNFTs = await Promise.all(
        activeAuctions.map(async (auction: any) => {
          const nft = await fetchNFTDetails(auction.nft_id.toString())
          if (rarity && nft.rarity !== rarity) {
            return null
          }
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

      setAuctions(
        auctionNFTs.filter((nft): nft is NFTWithDetails => nft !== null),
      )
      setError(null)
    } catch (err) {
      console.error("Error fetching auctions:", err)
      setError("Failed to fetch auctions")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchAuctions()
  }, [rarity])

  return {
    auctions,
    loading,
    error,
    refetch: () => {
      setLoading(true)
      fetchAuctions()
    },
  }
}
