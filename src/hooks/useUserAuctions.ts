import { useState, useEffect } from "react"
import { AuctionData } from "../types"
import { fetchUserAuctions } from "../utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

export const useUserAuctions = () => {
  const [auctions, setAuctions] = useState<AuctionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { account } = useWallet()

  const loadAuctions = async () => {
    if (!account) {
      setAuctions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const fetchedAuctions = await fetchUserAuctions(account.address)
      setAuctions(fetchedAuctions)
      setError(null)
    } catch (err) {
      setError("Failed to fetch auctions")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    loadAuctions()
  }, [account])

  const refreshAuctions = async () => {
    if (!account) return

    try {
      setLoading(true)
      const fetchedAuctions = await fetchUserAuctions(account.address)
      setAuctions(fetchedAuctions)
      setError(null)
    } catch (err) {
      setError("Failed to fetch auctions")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { auctions, loading, error, refreshAuctions }
}
