// src\components\auction\CreateAuctionModal.tsx
import React, { useState } from "react"
import { Modal, Form, Input, Button, message } from "antd"
import { NFTWithDetails } from "../../types"
import { createAuction } from "../../utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

interface CreateAuctionModalProps {
  visible: boolean
  nft: NFTWithDetails
  onCancel: () => void
  onSuccess: () => void
}

const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({
  visible,
  nft,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { account } = useWallet()

  const handleSubmit = async (values: {
    startPrice: number
    duration: number
  }) => {
    if (!account) return

    setLoading(true)
    try {
      await createAuction(
        nft.id,
        values.startPrice,
        values.duration * 3600, // Convert hours to seconds
      )
      message.success("Auction created successfully")
      onSuccess()
    } catch (error) {
      console.error("Error creating auction:", error)
      message.error("Failed to create auction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Create Auction"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="startPrice"
          label="Starting Price (APT)"
          rules={[
            { required: true, message: "Please enter a starting price" },
            {
              validator: (_, value) =>
                value && value > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error("Price must be positive")),
            },
          ]}
        >
          <Input type="number" step="0.1" />
        </Form.Item>

        <Form.Item
          name="duration"
          label="Duration (hours)"
          rules={[
            { required: true, message: "Please enter auction duration" },
            {
              validator: (_, value) =>
                value && value >= 1
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("Duration must be at least 1 hour"),
                    ),
            },
          ]}
        >
          <Input type="number" min="1" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Create Auction
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateAuctionModal
