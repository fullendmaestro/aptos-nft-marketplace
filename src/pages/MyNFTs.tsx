import React, { useEffect } from "react"
import { Typography, Tabs, Spin } from "antd"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { MyNFTsTab } from "../types"
import NFTList from "../components/nft/NFTList"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { fetchUserNFTsList } from "../store/slices/nftsSlice"
import { fetchUserAuctionsList } from "../store/slices/auctionsSlice"
import {
  fetchUserIncomingOffers,
  fetchUserOutgoingOffers,
} from "../store/slices/offersSlice"
import { setSelectedRarity } from "../store/slices/userSlice"
import RarityFilter from "../components/common/RarityFilter"

const { Title } = Typography
const { TabPane } = Tabs

const MyNFTs: React.FC = () => {
  const { connected, account } = useWallet()
  const dispatch = useAppDispatch()

  const { selectedRarity } = useAppSelector(state => state.user)
  const { userNFTs, loading: nftsLoading } = useAppSelector(state => state.nfts)
  const { userAuctions, loading: auctionsLoading } = useAppSelector(
    state => state.auctions,
  )
  const {
    incomingOffers,
    outgoingOffers,
    loading: offersLoading,
  } = useAppSelector(state => state.offers)

  useEffect(() => {
    if (connected && account) {
      refreshData()
    }
  }, [dispatch, connected, account, selectedRarity])

  const refreshData = () => {
    if (account) {
      dispatch(fetchUserNFTsList(account.address))
      dispatch(fetchUserAuctionsList(account.address))
      dispatch(fetchUserIncomingOffers(account.address))
      dispatch(fetchUserOutgoingOffers(account.address))
    }
  }

  const handleRarityChange = (value: number | "all") => {
    dispatch(setSelectedRarity(value))
  }

  const filterByRarity = (items: any[]) => {
    return selectedRarity === "all"
      ? items
      : items.filter(item => item.rarity === selectedRarity)
  }

  if (!connected) {
    return (
      <div className="text-center py-8">
        Please connect your wallet to view your NFTs
      </div>
    )
  }

  const getTabContent = (tabType: MyNFTsTab) => {
    switch (tabType) {
      case "owned":
        return nftsLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <NFTList nfts={filterByRarity(userNFTs)} tabType={tabType} />
        )
      case "in-auction":
        return auctionsLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <NFTList nfts={filterByRarity(userAuctions)} tabType={tabType} />
        )
      case "offers":
        return offersLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <NFTList nfts={filterByRarity(incomingOffers)} tabType={tabType} />
        )
      case "o-offers":
        return offersLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <NFTList nfts={filterByRarity(outgoingOffers)} tabType={tabType} />
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>My NFTs</Title>
        <RarityFilter rarity={selectedRarity} onChange={handleRarityChange} />
      </div>

      <Tabs defaultActiveKey="owned" className="mb-8">
        <TabPane tab="My NFTs" key="owned">
          {getTabContent("owned")}
        </TabPane>
        <TabPane tab="In Auction" key="in-auction">
          {getTabContent("in-auction")}
        </TabPane>
        <TabPane tab="Incoming Offers" key="incoming-offers">
          {getTabContent("offers")}
        </TabPane>
        <TabPane tab="Outgoing Offers" key="outgoing-offers">
          {getTabContent("o-offers")}
        </TabPane>
      </Tabs>
    </div>
  )
}

export default MyNFTs
