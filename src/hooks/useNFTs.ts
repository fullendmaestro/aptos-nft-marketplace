// src\hooks\useNFTs.ts
import { useState, useEffect } from "react"
import {
  NFTWithDetails,
  MarketplaceTab,
  Auction,
  AuctionData,
  ListedNFT,
  NFTDataList,
} from "../types"
import {
  fetchAvailableNFTs,
  fetchUserAuctionNFTs,
  fetchIncomingOffers,
  client,
  fetchNFTDetails,
  fetchNFTs as fetchListedNFTs,
} from "../utils/aptosUtils"

import { marketplaceAddr } from "@/constants"

export const useNFTs = (tab: MarketplaceTab, rarity?: "all" | number) => {
  const [nfts, setNFTs] = useState<NFTDataList>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNFTs = async () => {
    try {
      setLoading(true)
      let fetchedNFTs: NFTDataList = []

      switch (tab) {
        case "available":
          fetchedNFTs = await fetchAvailableNFTs()
          break
        case "listed":
          fetchedNFTs = await fetchListedNFTs(1)
          console.log("fetched listed nfts", fetchedNFTs)
          break
        case "auctions":
          // Fetch all auctions
          const marketplace = await client.getAccountResource(
            marketplaceAddr,
            `${marketplaceAddr}::NFTMarketplace::Marketplace`,
          )
          const auctions = (marketplace.data as any).auctions
          const activeAuctions = auctions.filter((a: any) => a.is_active)
          fetchedNFTs = await Promise.all(
            activeAuctions.map(async (auction: any) => {
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
          break
      }

      if (rarity && rarity !== "all") {
        fetchedNFTs = fetchedNFTs.filter(nft => nft.rarity === rarity)
      }

      setNFTs(fetchedNFTs)
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
  }, [tab, rarity])

  return {
    nfts,
    loading,
    error,
    refetch: () => {
      setLoading(true)
      fetchNFTs()
    },
  }
}
