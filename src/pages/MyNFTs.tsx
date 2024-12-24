import React, { useEffect } from "react"
import { Typography, Tabs, Spin } from "antd"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { MyNFTsTab } from "../types"
import NFTList from "../components/nft/NFTList"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { fetchUserNFTsList } from "../store/slices/nftsSlice"
import { fetchUserAuctionsList } from "../store/slices/auctionsSlice"
import { fetchUserIncomingOffers } from "../store/slices/offersSlice"

const { Title } = Typography
const { TabPane } = Tabs

const MyNFTs: React.FC = () => {
  const { connected, account } = useWallet()
  const dispatch = useAppDispatch()

  const { userNFTs, loading: nftsLoading } = useAppSelector(state => state.nfts)
  const { userAuctions, loading: auctionsLoading } = useAppSelector(
    state => state.auctions,
  )
  const { incomingOffers, loading: offersLoading } = useAppSelector(
    state => state.offers,
  )

  useEffect(() => {
    if (connected && account) {
      dispatch(fetchUserNFTsList(account.address))
      dispatch(fetchUserAuctionsList(account.address))
      dispatch(fetchUserIncomingOffers(account.address))
    }
  }, [dispatch, connected, account])

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
          <NFTList nfts={userNFTs} tabType={tabType} />
        )
      case "in-auction":
        return auctionsLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <NFTList
            nfts={userAuctions.map(auction => ({
              ...auction,
              price: auction.auction.current_bid,
              for_sale: true,
            }))}
            tabType={tabType}
          />
        )
      case "offers":
        return offersLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <NFTList
            nfts={incomingOffers.map(offer => ({
              ...offer,
              price: offer.offers[0].price,
              for_sale: true,
            }))}
            tabType={tabType}
          />
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-6">
        My NFTs
      </Title>

      <Tabs defaultActiveKey="owned" className="mb-8">
        <TabPane tab="Not For Sale" key="owned">
          {getTabContent("owned")}
        </TabPane>

        <TabPane tab="In Auction" key="in-auction">
          {getTabContent("in-auction")}
        </TabPane>

        <TabPane tab="Incoming Offers" key="offers">
          {getTabContent("offers")}
        </TabPane>
      </Tabs>
    </div>
  )
}

export default MyNFTs
