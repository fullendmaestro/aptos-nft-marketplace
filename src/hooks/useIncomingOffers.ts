// src\hooks\useIncomingOffers.ts
import { useState, useEffect } from "react"
import { OfferData } from "../types"
import { fetchIncomingOffers } from "../utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

export const useIncomingOffers = () => {
  const [offers, setOffers] = useState<OfferData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { account } = useWallet()

  useEffect(() => {
    const loadOffers = async () => {
      if (!account) {
        setOffers([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const fetchedOffers = await fetchIncomingOffers(account.address)
        setOffers(fetchedOffers)
        setError(null)
      } catch (err) {
        setError("Failed to fetch offers")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadOffers()
  }, [account])

  const refreshOffers = async () => {
    if (!account) return

    try {
      setLoading(true)
      const fetchedOffers = await fetchIncomingOffers(account.address)
      setOffers(fetchedOffers)
      setError(null)
    } catch (err) {
      setError("Failed to fetch offers")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { offers, loading, error, refreshOffers }
}
