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

// import React, { useState, useEffect } from "react"
// import { Card, Statistic, Button, Modal } from "antd"
// import { useWallet } from "@aptos-labs/wallet-adapter-react"
// import { marketplaceAddr } from "@/constants"
// import { AuctionData } from "@/types"

// const { Meta } = Card
// const { Countdown } = Statistic

// interface AuctionCardProps {
//   auction: AuctionData
//   showEndAuction?: boolean
//   onAuctionEnded?: () => void
// }

// const AuctionCard: React.FC<AuctionCardProps> = ({
//   auction,
//   showEndAuction = false,
//   onAuctionEnded,
// }) => {
//   console.log("this is the auction", auction)
//   const [isModalVisible, setIsModalVisible] = useState(false)
//   const [timeLeft, setTimeLeft] = useState<number>(0)
//   const [loading, setLoading] = useState(false)
//   const { account } = useWallet()

//   useEffect(() => {
//     const endTime = parseInt(auction.auction.end_time.toString()) * 1000
//     const now = Date.now()
//     setTimeLeft(Math.max(0, endTime - now))

//     const timer = setInterval(() => {
//       const remaining = Math.max(0, endTime - Date.now())
//       setTimeLeft(remaining)
//       if (remaining === 0) {
//         clearInterval(timer)
//         if (onAuctionEnded) onAuctionEnded()
//       }
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [auction.auction.end_time, onAuctionEnded])

//   return (
//     <Card
//       cover={<img alt={auction.name} src={auction.uri} />}
//       actions={[
//         <Button type="primary" onClick={() => setIsModalVisible(true)}>
//           Place Bid
//         </Button>,
//       ]}
//     >
//       <Meta title={auction.name} description={auction.description} />
//       <p>Current Bid: {auction.auction.current_bid} ETH</p>
//       <p>Start Price: {auction.auction.start_price} ETH</p>
//       <p>Highest Bidder: {auction.auction.highest_bidder}</p>
//       <Countdown title="Time Left" value={Date.now() + timeLeft} />
//       <Modal
//         title="Place a Bid"
//         visible={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         footer={null}
//       >
//         {/* Modal content for placing a bid */}
//       </Modal>
//     </Card>
//   )
// }

// export default AuctionCard
