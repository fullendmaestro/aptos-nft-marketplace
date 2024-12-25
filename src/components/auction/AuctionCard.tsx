// src\components\auction\AuctionCard.tsx
import React, { useState } from "react"
import { Card, Tag, Button, Statistic } from "antd"
import { AuctionData } from "../../types"

import PlaceBidModal from "./PlaceBidModal"
import { truncateAddress } from "@/lib/utils"
import { rarityColors, rarityLabels } from "@/constants"

const { Meta } = Card
const { Countdown } = Statistic

interface AuctionCardProps {
  auction: AuctionData
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)
  const handleCancel = () => setIsModalVisible(false)
  const handleBidPlaced = () => {
    // Refresh auction data or update UI as needed
  }

  return (
    <>
      <Card
        hoverable
        className="w-full max-w-[240px] mx-auto"
        cover={<img alt={auction.name} src={auction.uri} />}
        actions={[
          <Button
            type="primary"
            onClick={showModal}
            disabled={
              !auction.auction.is_active ||
              auction.auction.end_time * 1000 < Date.now()
            }
          >
            Place Bid
          </Button>,
        ]}
      >
        <Tag
          color={rarityColors[auction.rarity]}
          className="text-sm font-bold mb-2"
        >
          {rarityLabels[auction.rarity]}
        </Tag>

        <Meta
          title={auction.name}
          description={`Current Bid: ${auction.auction.current_bid} APT`}
        />
        <p className="mt-2">{auction.description}</p>
        <p>ID: {auction.id}</p>
        <p>Owner: {truncateAddress(auction.owner)}</p>
        <p>Seller: {truncateAddress(auction.auction.seller)}</p>
        <p>Highest Bidder: {truncateAddress(auction.auction.highest_bidder)}</p>
        <p>Status: {auction.status}</p>
        <Countdown
          title="Time Left"
          value={auction.auction.end_time * 1000}
          format="D [days] H [hrs] m [mins] s [secs]"
        />
      </Card>
      <PlaceBidModal
        visible={isModalVisible}
        auction={auction}
        onCancel={handleCancel}
        onBidPlaced={handleBidPlaced}
      />
    </>
  )
}

export default AuctionCard
