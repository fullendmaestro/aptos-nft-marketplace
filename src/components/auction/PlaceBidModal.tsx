import React, { useState } from "react"
import { Modal, Form, Input, Button, message } from "antd"
import { AuctionData } from "../../types"
import { placeBid } from "../../utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

interface PlaceBidModalProps {
  visible: boolean
  auction: AuctionData | null
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

  // Update the error handling in handleSubmit
  const handleSubmit = async (values: { bidAmount: number }) => {
    if (!auction || !account) {
      message.error("Missing auction details or wallet not connected")
      return
    }

    setLoading(true)
    try {
      await placeBid(account.address, auction.id, values.bidAmount)
      message.success("Bid placed successfully!")
      onBidPlaced()
      onCancel()
    } catch (error: any) {
      console.error("Error placing bid:", error)
      message.error(error.message)
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

// {
//   "current_bid": 0.5,
//   "end_time": "1734445381",
//   "highest_bidder": "0x29f95737c58925e13cd10b8dc1d98109339e2442b2ea1938f454ca816b7d0914",
//   "is_active": true,
//   "nft_id": "9",
//   "seller": "0x29f95737c58925e13cd10b8dc1d98109339e2442b2ea1938f454ca816b7d0914",
//   "start_price": 0.5,
//   "nft_detail": {
//       "id": "9",
//       "owner": "0x29f95737c58925e13cd10b8dc1d98109339e2442b2ea1938f454ca816b7d0914",
//       "name": "Auct",
//       "description": "A waterfall that flows endlessly, reflecting the infinite beauty of nature.",
//       "uri": "https://fastly.picsum.photos/id/802/200/200.jpg?hmac=alfo3M8Ps4XWmFJGIwuzLUqOrwxqkE5_f65vCtk6_Iw",
//       "price": 0,
//       "for_sale": true,
//       "rarity": 4
//   }
// }
