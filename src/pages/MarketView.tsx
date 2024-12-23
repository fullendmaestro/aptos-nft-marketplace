// src\pages\MarketView.tsx

import React, { useState } from "react"
import { Typography, Tabs, Spin } from "antd"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { NFTWithDetails, MarketplaceTab } from "../types"
import RarityFilter from "../components/common/RarityFilter"
import NFTList from "../components/nft/NFTList"
import { useNFTs } from "../hooks/useNFTs"

const { Title } = Typography
const { TabPane } = Tabs

const MarketView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("available")
  const [rarity, setRarity] = useState<"all" | number>("all")
  const { connected } = useWallet()

  const { nfts: availableNFTs, loading: loadingAvailable } = useNFTs(
    "available",
    rarity,
  )
  const { nfts: listedNFTs, loading: loadingListed } = useNFTs("listed", rarity)
  const { nfts: auctionNFTs, loading: loadingAuctions } = useNFTs(
    "auctions",
    rarity,
  )

  const getTabContent = (
    nfts: NFTWithDetails[],
    loading: boolean,
    tabType: string,
  ) => {
    if (!connected) {
      return (
        <div className="text-center py-8">
          Please connect your wallet to view NFTs
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      )
    }

    return <NFTList nfts={nfts} tabType={tabType} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>NFT Marketplace</Title>
        <RarityFilter rarity={rarity} onChange={value => setRarity(value)} />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={key => setActiveTab(key as MarketplaceTab)}
        className="mb-8"
      >
        <TabPane tab="Available NFTs" key="available">
          {getTabContent(availableNFTs, loadingAvailable, "available")}
        </TabPane>
        <TabPane tab="Listed NFTs" key="listed">
          {getTabContent(listedNFTs, loadingListed, "listed")}
        </TabPane>
        <TabPane tab="Auctions" key="auctions">
          {getTabContent(auctionNFTs, loadingAuctions, "auctions")}
        </TabPane>
      </Tabs>
    </div>
  )
}

export default MarketView
