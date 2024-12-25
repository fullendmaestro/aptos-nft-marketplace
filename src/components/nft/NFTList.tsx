import React from "react"
import { Row, Col, Empty } from "antd"
import { NFTDataList } from "../../types"
import NFTCard from "./NFTCard"
import Pagination from "../common/Pagination"
import ListedNFTCard from "./ListedNFTCard"
import AuctionCard from "../auction/AuctionCard"
import UserNFTCard from "./UserNFTCard"
import UserAuctionCard from "../auction/UserAuctionCard"
import UserOfferCard from "../offer/UserOfferCard"
import UserOutgoingOfferCard from "../offer/UserOutgoingOfferCard"

interface NFTListProps {
  nfts: NFTDataList
  tabType: string
}

const NFTList: React.FC<NFTListProps> = ({ nfts, tabType }) => {
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 8

  if (!nfts.length) {
    return <Empty description="No NFTs found" />
  }

  const paginatedNFTs = nfts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const renderNFTCard = (nft: any) => {
    switch (tabType) {
      case "available":
        return <NFTCard nft={nft} />
      case "listed":
        return <ListedNFTCard listing={nft} />
      case "auctions":
        return <AuctionCard auction={nft} />
      case "owned":
        return <UserNFTCard nft={nft} />
      case "in-auction":
        return <UserAuctionCard auction={nft} />
      case "offers":
        return <UserOfferCard offer={nft} />
      case "o-offers":
        return <UserOutgoingOfferCard nft={nft} />
      default:
        return <NFTCard nft={nft} />
    }
  }

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
            {renderNFTCard(nft)}
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
