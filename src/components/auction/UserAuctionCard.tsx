// src\components\auction\UserAuctionCard.tsx
import React, { useState } from "react"
import { Card, Tag, Button, message, Statistic } from "antd"
import { AuctionData, OfferData } from "../../types"
import { truncateAddress } from "@/lib/utils"
import { rarityColors, rarityLabels } from "@/constants"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { client } from "@/utils/aptosUtils"
import { marketplaceAddr } from "@/constants"
import EndAuctionModal from "./EndAuctionModal"

const { Meta } = Card
const { Countdown } = Statistic

interface UserAuctionCardProps {
  auction: AuctionData
  // onOfferAccepted?: () => void
}

const UserAuctionCard: React.FC<UserAuctionCardProps> = ({
  auction,
  // onOfferAccepted,
}) => {
  console.log("this is the user return auction card arg auction", auction)
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
            disabled={!auction.auction.is_active}
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
      <EndAuctionModal
        visible={isModalVisible}
        auction={auction}
        onCancel={handleCancel}
        onBidPlaced={handleBidPlaced}
      />
    </>
  )
}

export default UserAuctionCard
