// src\hooks\useUserNFTs.ts
import { useState, useEffect } from "react"
import { NFT } from "../types"
import { fetchUserNFTs } from "../utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

export const useUserNFTs = () => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { account } = useWallet()

  useEffect(() => {
    const loadNFTs = async () => {
      if (!account) {
        setNfts([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const fetchedNFTs = await fetchUserNFTs(account.address)
        setNfts(fetchedNFTs)
        setError(null)
      } catch (err) {
        setError("Failed to fetch NFTs")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadNFTs()
  }, [account])

  const refreshNFTs = async () => {
    if (!account) return

    try {
      setLoading(true)
      const fetchedNFTs = await fetchUserNFTs(account.address)
      setNfts(fetchedNFTs)
      setError(null)
    } catch (err) {
      setError("Failed to fetch NFTs")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { nfts, loading, error, refreshNFTs }
}
