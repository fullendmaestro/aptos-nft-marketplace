// src\components\nft\NFTList.tsx
import React from "react"
import { Row, Col, Empty } from "antd"
import { AuctionData, ListedNFT, NFTWithDetails, OfferData } from "../../types"
import NFTCard from "./NFTCard"
import Pagination from "../common/Pagination"
import ListedNFTCard from "./ListedNFTCard"
import AuctionCard from "../auction/AuctionCard"
import UserNFTCard from "./userNFTCard"
import UserAuctionCard from "../auction/UserAuctionCard"
import UserOffersCard from "../offer/UserOfferCard"
import UserOfferCard from "../offer/UserOfferCard"
import { O } from "vitest/dist/reporters-yx5ZTtEV.js"

interface NFTListProps {
  nfts: NFTWithDetails[] | AuctionData[] | OfferData[] | ListedNFT[]
  tabType: string
}

const NFTList: React.FC<NFTListProps> = ({ nfts, tabType }) => {
  console.log("auctionNFTs.... argv", nfts, tabType)
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
            {tabType === "available" && <NFTCard nft={nft} />}
            {tabType === "listed" && <ListedNFTCard listing={nft} />}
            {tabType === "auctions" && <AuctionCard auction={nft} />}
            {tabType === "owned" && <UserNFTCard nft={nft} />}
            {tabType === "in-auction" && <UserAuctionCard auction={nft} />}
            {tabType === "offers" && <UserOfferCard offer={nft} />}
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

export default NFTList
