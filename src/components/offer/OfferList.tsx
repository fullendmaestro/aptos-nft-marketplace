// src\components\offer\OfferList.tsx
import React from "react"
import { Row, Col } from "antd"
import { OfferData } from "../../types"
import OfferCard from "./OfferCard"
import Pagination from "../common/Pagination"

interface OfferListProps {
  offers: OfferData[]
  loading: boolean
}

const OfferList: React.FC<OfferListProps> = ({ offers, loading }) => {
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 8

  const paginatedOffers = offers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <>
      <Row
        gutter={[24, 24]}
        className="mt-5 w-full flex justify-center flex-wrap"
      >
        {loading ? (
          <Col span={24}>Loading offers...</Col>
        ) : paginatedOffers.length === 0 ? (
          <Col span={24}>No active offers available.</Col>
        ) : (
          paginatedOffers.map(offer => (
            <Col
              key={offer.nft_id}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={6}
              className="flex justify-center items-center"
            >
              <OfferCard offer={offer} />
            </Col>
          ))
        )}
      </Row>
      <Pagination
        current={currentPage}
        total={offers.length}
        pageSize={pageSize}
        onChange={page => setCurrentPage(page)}
      />
    </>
  )
}

export default OfferList
