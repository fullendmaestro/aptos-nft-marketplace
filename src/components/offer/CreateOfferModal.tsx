// src\components\offer\CreateOfferModal.tsx
import React, { useState } from "react"
import { Modal, Form, Input, Button, message } from "antd"
import { NFT, NFTWithDetails } from "../../types"
import { createOffer } from "../../utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

interface CreateOfferModalProps {
  visible: boolean
  nft: NFT
  onCancel: () => void
  onSuccess: () => void
}

const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
  visible,
  nft,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { account } = useWallet()

  const handleSubmit = async (values: { price: number; duration: number }) => {
    if (!account) return

    setLoading(true)
    try {
      await createOffer(
        nft.id,
        values.price,
        values.duration * 3600, // Convert hours to seconds
      )
      message.success("Offer created successfully")
      onSuccess()
    } catch (error) {
      console.error("Error creating offer:", error)
      message.error("Failed to create offer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Make an Offer"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="price"
          label="Offer Price (APT)"
          rules={[
            { required: true, message: "Please enter an offer price" },
            {
              validator: (_, value) =>
                value > 0
                  ? Promise.resolve()
                  : Promise.reject("Price must be positive"),
            },
          ]}
        >
          <Input type="number" step="0.1" />
        </Form.Item>

        <Form.Item
          name="duration"
          label="Offer Duration (hours)"
          rules={[
            { required: true, message: "Please enter offer duration" },
            {
              validator: (_, value) =>
                value >= 1
                  ? Promise.resolve()
                  : Promise.reject("Duration must be at least 1 hour"),
            },
          ]}
        >
          <Input type="number" min="1" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Create Offer
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateOfferModal
