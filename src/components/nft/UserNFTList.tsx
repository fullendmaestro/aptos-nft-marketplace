// src\components\nft\UserNFTList.tsx
import React, { useState } from "react"
import { Row, Col, Empty, Spin } from "antd"
import {
  Auction,
  AuctionData,
  ListedNFT,
  NFTWithDetails,
  OfferData,
} from "../../types"
import NFTCard from "./NFTCard"
import Pagination from "../common/Pagination"
import ListedNFTCard from "./ListedNFTCard"
import AuctionCard from "../auction/AuctionCard"
import UserNFTCard from "./userNFTCard"
import UserAuctionCard from "../auction/UserAuctionCard"
import UserOffersCard from "../offer/UserOfferCard"
import UserOfferCard from "../offer/UserOfferCard"
import { O } from "vitest/dist/reporters-yx5ZTtEV.js"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useMyNFTs } from "@/hooks/useMyNFTs"

interface UserNFTListProps {
  tabType: string
}

const UserNFTList: React.FC<UserNFTListProps> = ({ tabType }) => {
  const [nfts, setNfts] = useState<any>([])
  const { connected, account } = useWallet()

  const { ownedNFTs, auctionNFTs, offerNFTs, loading } = useMyNFTs(
    account?.address,
  )

  if (tabType === "owned") {
    setNfts(ownedNFTs)
  } else if (tabType === "in-auctions") {
    setNfts(auctionNFTs)
  } else if (tabType === "offers") {
    setNfts(offerNFTs)
  }
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 8

  if (!nfts.length) {
    return <Empty description="No NFTs found" />
  }

  const paginatedNFTs = nfts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  console.log("tabtype and its nfts", tabType, nfts)

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" />
      </div>
    )

  return (
    <>
      <Row gutter={[24, 24]} className="mt-5">
        {paginatedNFTs.map(nft => (
          <Col
            key={nft.id}
            xs={24}
            sm={12}
            md={8}
            lg={6}
            className="flex justify-center"
          >
            {tabType === "owned" && <UserNFTCard nft={nft} />}
            {tabType === "in-auction" && (
              <UserAuctionCard auction={nft} auct={nft.auction} />
            )}
            {/* {tabType === "offers" && <UserOfferCard offer={nft} />} */}
          </Col>
        ))}
      </Row>

      <Pagination
        current={currentPage}
        total={nfts.length}
        pageSize={pageSize}
        onChange={setCurrentPage}
      />
    </>
  )
}

export default UserNFTList
