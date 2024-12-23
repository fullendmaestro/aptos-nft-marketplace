// src\components\auction\UserAuctionCard.tsx
import React, { useState } from "react"
import { Card, Tag, Button, message, Statistic } from "antd"
import { AuctionData } from "../../types"
import { truncateAddress } from "@/lib/utils"
import { rarityColors, rarityLabels } from "@/constants"
import EndAuctionModal from "./EndAuctionModal"

const { Meta } = Card
const { Countdown } = Statistic

interface UserAuctionCardProps {
  auction: AuctionData
}

const UserAuctionCard: React.FC<UserAuctionCardProps> = ({ auction }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)
  const handleCancel = () => setIsModalVisible(false)
  const handleAuctionEnded = () => {
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
            disabled={!auction.auction.is_active}
          >
            End Auction
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
        <div className="mt-4 p-2 bg-gray-100 rounded-lg">
          <Countdown
            title={<span className="text-lg font-semibold">Time Left</span>}
            value={auction.auction.end_time * 1000}
            format="D [days] H [hrs] m [mins] s [secs]"
            className="text-center"
          />
        </div>
      </Card>
      <EndAuctionModal
        visible={isModalVisible}
        auction={auction}
        onCancel={handleCancel}
        onAuctionEnded={handleAuctionEnded}
      />
    </>
  )
}

export default UserAuctionCard
