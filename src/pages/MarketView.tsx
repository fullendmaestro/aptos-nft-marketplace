import React, { useEffect } from "react"
import { Typography, Tabs, Spin } from "antd"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { MarketplaceTab } from "../types"
import RarityFilter from "../components/common/RarityFilter"
import NFTList from "../components/nft/NFTList"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import {
  fetchAvailableNFTsList,
  fetchListedNFTsList,
} from "../store/slices/nftsSlice"
import { fetchMarketplaceAuctions } from "../store/slices/auctionsSlice"
import { setSelectedRarity, setViewType } from "../store/slices/userSlice"

const { Title } = Typography
const { TabPane } = Tabs

const MarketView: React.FC = () => {
  const { connected } = useWallet()
  const dispatch = useAppDispatch()

  const { selectedRarity, viewType } = useAppSelector(state => state.user)
  const {
    availableNFTs,
    listedNFTs,
    loading: nftsLoading,
  } = useAppSelector(state => state.nfts)
  const { marketplaceAuctions, loading: auctionsLoading } = useAppSelector(
    state => state.auctions,
  )

  useEffect(() => {
    if (connected) {
      refreshData()
    }
  }, [dispatch, connected, viewType, selectedRarity])

  const refreshData = () => {
    const rarityParam = selectedRarity === "all" ? undefined : selectedRarity
    dispatch(fetchAvailableNFTsList())
    dispatch(fetchListedNFTsList())
    dispatch(fetchMarketplaceAuctions())
  }

  const handleRarityChange = (value: number | "all") => {
    dispatch(setSelectedRarity(value))
    refreshData()
  }

  const getTabContent = (tabType: MarketplaceTab) => {
    if (!connected) {
      return (
        <div className="text-center py-8">
          Please connect your wallet to view NFTs
        </div>
      )
    }

    switch (tabType) {
      case "available":
        return nftsLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <NFTList nfts={availableNFTs} tabType={tabType} />
        )
      case "listed":
        return nftsLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <NFTList nfts={listedNFTs} tabType={tabType} />
        )
      case "auctions":
        return auctionsLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <NFTList nfts={marketplaceAuctions} tabType={tabType} />
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>NFT Marketplace</Title>
        <RarityFilter rarity={selectedRarity} onChange={handleRarityChange} />
      </div>

      <Tabs
        activeKey={viewType}
        onChange={key =>
          dispatch(setViewType(key as "available" | "listed" | "auctions"))
        }
        className="mb-8"
      >
        <TabPane tab="Available NFTs" key="available">
          {getTabContent("available")}
        </TabPane>
        <TabPane tab="Listed NFTs" key="listed">
          {getTabContent("listed")}
        </TabPane>
        <TabPane tab="Auctions" key="auctions">
          {getTabContent("auctions")}
        </TabPane>
      </Tabs>
    </div>
  )
}

export default MarketView
