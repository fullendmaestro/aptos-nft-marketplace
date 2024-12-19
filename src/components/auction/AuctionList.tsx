import React, { useState } from "react"
import { Row, Col } from "antd"
import { AuctionData } from "../../types"
import AuctionCard from "./AuctionCard"
import Pagination from "../common/Pagination"
import { useAuctions } from "@/hooks/useAuctions"

interface AuctionListProps {
  auctions: AuctionData[]
  loading: boolean
}

const AuctionList: React.FC<AuctionListProps> = ({ auctions, loading }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8
  const { refetch } = useAuctions()

  const paginatedAuctions = auctions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const handleBidPlaced = async () => {
    await refetch()
  }

  return (
    <>
      <Row
        gutter={[24, 24]}
        className="mt-5 w-full flex justify-center flex-wrap"
      >
        {loading ? (
          <Col span={24}>Loading auctions...</Col>
        ) : paginatedAuctions.length === 0 ? (
          <Col span={24}>No active auctions available.</Col>
        ) : (
          paginatedAuctions.map(auction => (
            <Col
              key={auction.nft_id}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={6}
              className="flex justify-center items-center"
            >
              <AuctionCard auction={auction} onBidPlaced={handleBidPlaced} />
            </Col>
          ))
        )}
      </Row>
      <Pagination
        current={currentPage}
        total={auctions.length}
        pageSize={pageSize}
        onChange={page => setCurrentPage(page)}
      />
    </>
  )
}

export default AuctionList
