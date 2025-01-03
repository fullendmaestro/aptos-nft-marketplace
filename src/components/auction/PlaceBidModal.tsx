// src\components\auction\PlaceBidModal.tsx
import React, { useState } from "react"
import { Modal, Form, Input, Button, message } from "antd"
import { AuctionData } from "../../types"
import { placeBid } from "../../utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useAppDispatch } from "../../store/hooks"
import {
  refreshMarketplaceAuctions,
  refreshUserAuctions,
} from "../../store/slices/auctionsSlice"

interface PlaceBidModalProps {
  visible: boolean
  auction: AuctionData
  onCancel: () => void
  onBidPlaced: () => void
}

const PlaceBidModal: React.FC<PlaceBidModalProps> = ({
  visible,
  auction,
  onCancel,
  onBidPlaced,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { account } = useWallet()
  const dispatch = useAppDispatch()

  const handleSubmit = async (values: { bidAmount: number }) => {
    if (!auction || !account) {
      message.error("Missing auction details or wallet not connected")
      return
    }

    setLoading(true)
    try {
      await placeBid(auction.id, values.bidAmount)
      message.success("Bid placed successfully!")
      onBidPlaced()
      dispatch(refreshMarketplaceAuctions(undefined))
      if (auction.owner === account.address) {
        dispatch(refreshUserAuctions(account.address))
      }
      onCancel()
    } catch (error: any) {
      console.error("Error placing bid:", error)
      message.error("Error placing bid")
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
    <Modal title="Place a Bid" open={visible} onCancel={onCancel} footer={null}>
      {auction && (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <div className="mb-4">
            <p>
              <strong>NFT Name:</strong> {auction.name}
            </p>
            <p>
              <strong>Current Bid:</strong> {auction.auction.current_bid} APT
            </p>
            <p>
              <strong>Minimum Next Bid:</strong>{" "}
              {auction.auction.current_bid + 0.1} APT
            </p>
          </div>

          <Form.Item
            name="bidAmount"
            label="Your Bid Amount (APT)"
            rules={[
              { required: true, message: "Please enter your bid amount" },
              { validator: validateBidAmount },
            ]}
          >
            <Input
              type="number"
              step="0.1"
              min={auction.auction.current_bid + 0.1}
              placeholder={`Enter amount higher than ${auction.auction.current_bid} APT`}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Place Bid
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}

export default PlaceBidModal
