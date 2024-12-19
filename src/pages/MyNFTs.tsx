// src\pages\MyNFTs.tsx
import React, { useState } from "react"
import { Typography, Tabs, Spin } from "antd"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { MyNFTsTab } from "../types"
import NFTList from "../components/nft/NFTList"
import { useMyNFTs } from "@/hooks/useMyNFTs"

const { Title } = Typography
const { TabPane } = Tabs

const MyNFTs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MyNFTsTab>("owned")
  const { connected, account } = useWallet()

  const { ownedNFTs, auctionNFTs, offerNFTs, loading } = useMyNFTs(
    account?.address,
  )

  console.log("ownedNFTs", ownedNFTs)
  console.log("auctionNFTs", auctionNFTs)
  console.log("offerNFTs", offerNFTs)

  if (!connected) {
    return (
      <div className="text-center py-8">
        Please connect your wallet to view your NFTs
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-6">
        My NFTs
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={key => setActiveTab(key as MyNFTsTab)}
        className="mb-8"
      >
        <TabPane tab="Not For Sale" key="owned">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <NFTList nfts={ownedNFTs} tabType={activeTab} />
          )}
        </TabPane>

        <TabPane tab="In Auction" key="in-auction">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <NFTList nfts={auctionNFTs} tabType={activeTab} />
          )}
        </TabPane>

        <TabPane tab="Incoming Offers" key="offers">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <NFTList nfts={offerNFTs} tabType={activeTab} />
          )}
        </TabPane>
      </Tabs>
    </div>
  )
}

export default MyNFTs
