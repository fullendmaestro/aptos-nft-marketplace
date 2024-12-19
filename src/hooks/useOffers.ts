// src\hooks\useOffers.ts
import { useState, useEffect } from "react"
import { NFTWithDetails } from "../types"
import { fetchNFTDetails, fetchNFTOffers, client } from "../utils/aptosUtils"
import { marketplaceAddr } from "../constants"

export const useOffers = (address?: string) => {
  const [offers, setOffers] = useState<NFTWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOffers = async () => {
    if (!address) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const marketplace = await client.getAccountResource(
        marketplaceAddr,
        `${marketplaceAddr}::NFTMarketplace::Marketplace`,
      )

      const allOffers = (marketplace.data as any).offers
      const activeOffers = allOffers.filter((o: any) => o.is_active)

      const offerNFTs = await Promise.all(
        activeOffers.map(async (offer: any) => {
          const nft = await fetchNFTDetails(offer.nft_id.toString())
          if (nft.owner !== address) {
            return null
          }
          const offers = await fetchNFTOffers(offer.nft_id.toString())
          return {
            ...nft,
            status: "has_offers" as const,
            offers,
          }
        }),
      )

      setOffers(offerNFTs.filter((nft): nft is NFTWithDetails => nft !== null))
      setError(null)
    } catch (err) {
      console.error("Error fetching offers:", err)
      setError("Failed to fetch offers")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchOffers()
  }, [address])

  return {
    offers,
    loading,
    error,
    refetch: () => {
      if (address) {
        setLoading(true)
        fetchOffers()
      }
    },
  }
}
