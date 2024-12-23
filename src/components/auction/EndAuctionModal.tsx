// src\components\auction\EndAuctionModal.tsx
import React, { useState } from "react"
import { Modal, Form, Input, Button, message } from "antd"
import { AuctionData } from "../../types"
import { endAuction, placeBid } from "../../utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { truncateAddress } from "@/lib/utils"

interface EndAuctionModalProps {
  visible: boolean
  auction: AuctionData | null
  onCancel: () => void
  onAuctionEnded: () => void
}

const EndAuctionModal: React.FC<EndAuctionModalProps> = ({
  visible,
  auction,
  onCancel,
  onAuctionEnded,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { account } = useWallet()

  // Update the error handling in handleSubmit
  const handleEndAuction = async () => {
    if (!auction || !account) {
      message.error("Missing auction details or wallet not connected")
      return
    }

    setLoading(true)
    try {
      await endAuction(auction.id)
      message.success("Bid ended successfully!")
      onAuctionEnded()
      onCancel()
    } catch (error: any) {
      console.error("Error Ending Auction:", error)
      message.error("Faled to End Auction")
    } finally {
      setLoading(false)
    }
  }

  const validateBidAmount = (_: any, value: number) => {
    if (!auction) return Promise.reject("No auction data available")
    if (!value) return Promise.reject("Please enter a bid amount")
    if (value <= auction.auction.current_bid) {
      return Promise.reject(
        `Bid must be higher than current bid (${auction.auction.current_bid} APT)`,
      )
    }
    return Promise.resolve()
  }

  return (
    <Modal
      title="End Auction"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="end"
          type="primary"
          danger
          loading={loading}
          onClick={handleEndAuction}
        >
          End Auction
        </Button>,
      ]}
    >
      {auction && (
        <div className="space-y-4">
          <p>Are you sure you want to end this auction?</p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>
              <strong>NFT:</strong> {auction.name}
            </p>
            <p>
              <strong>Current Bid:</strong> {auction.auction.current_bid} APT
            </p>
            <p>
              <strong>Highest Bidder:</strong>{" "}
              {truncateAddress(auction.auction.highest_bidder)}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Note: This action cannot be undone. The NFT will be transferred to
            the highest bidder.
          </p>
        </div>
      )}
    </Modal>
  )
}

export default EndAuctionModal
