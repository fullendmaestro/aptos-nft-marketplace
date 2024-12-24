import React, { useEffect } from "react"
import { Typography, Tabs, Spin } from "antd"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { MarketplaceTab } from "../types"
import RarityFilter from "../components/common/RarityFilter"
import NFTList from "../components/nft/NFTList"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { fetchMarketplaceNFTs } from "../store/slices/nftsSlice"
import { fetchMarketplaceAuctions } from "../store/slices/auctionsSlice"
import { setSelectedRarity, setViewType } from "../store/slices/userSlice"

const { Title } = Typography
const { TabPane } = Tabs

const MarketView: React.FC = () => {
  const { connected } = useWallet()
  const dispatch = useAppDispatch()

  const { selectedRarity, viewType } = useAppSelector(state => state.user)
  const { marketplaceNFTs, loading: nftsLoading } = useAppSelector(
    state => state.nfts,
  )
  const { marketplaceAuctions, loading: auctionsLoading } = useAppSelector(
    state => state.auctions,
  )

  useEffect(() => {
    if (connected) {
      if (viewType === "nfts" || viewType === "listed") {
        dispatch(
          fetchMarketplaceNFTs(
            selectedRarity === "all" ? undefined : selectedRarity,
          ),
        )
      } else if (viewType === "auctions") {
        dispatch(
          fetchMarketplaceAuctions(
            selectedRarity === "all" ? undefined : selectedRarity,
          ),
        )
      }
    }
  }, [dispatch, connected, viewType, selectedRarity])

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
          <NFTList
            nfts={marketplaceNFTs.filter(nft => !nft.for_sale)}
            tabType={tabType}
          />
        )
      case "listed":
        return nftsLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <NFTList
            nfts={marketplaceNFTs.filter(nft => nft.for_sale)}
            tabType={tabType}
          />
        )
      case "auctions":
        return auctionsLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <NFTList
            nfts={marketplaceAuctions.map(auction => ({
              ...auction,
              price: auction.auction.current_bid,
              for_sale: true,
            }))}
            tabType={tabType}
          />
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>NFT Marketplace</Title>
        <RarityFilter
          rarity={selectedRarity}
          onChange={value => dispatch(setSelectedRarity(value))}
        />
      </div>

      <Tabs
        activeKey={viewType}
        onChange={key =>
          dispatch(setViewType(key as "nfts" | "auctions" | "offers"))
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
