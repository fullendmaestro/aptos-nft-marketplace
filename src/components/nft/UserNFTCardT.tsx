// src\components\nft\userNFTCard.tsx
import React, { useState } from "react"
import {
  Typography,
  Card,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  message,
  Select,
} from "antd"
import { NFT, OwnedNFT } from "../../types"
import { truncateAddress } from "../../lib/utils"
import { rarityColors, rarityLabels } from "@/constants"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { client } from "@/utils/aptosUtils"
import { marketplaceAddr } from "@/constants"
import { useAppDispatch } from "@/store/hooks"
import { refreshUserNFTsList } from "@/store/slices/nftsSlice"

const { Title } = Typography
const { Meta } = Card
const { Option } = Select

interface UserNFTCardProps {
  nft: OwnedNFT
}

type selectedAction = "sell" | "auction" | "transfer" | "offer"

const UserNFTCard: React.FC<UserNFTCardProps> = ({ nft }) => {
  const dispatch = useAppDispatch()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedAction, setSelectedAction] = useState<selectedAction>("sell")
  const [loading, setLoading] = useState(false)
  const { account } = useWallet()
  const [form] = Form.useForm()

  const handleActionClick = (nft: NFT) => {
    setIsModalVisible(true)
    setSelectedAction("sell")
    form.resetFields()
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setSelectedAction("sell")
    form.resetFields()
  }

  const handleAction = async (values: any) => {
    if (!account) return

    setLoading(true)
    try {
      let payload
      switch (selectedAction) {
        case "sell":
          payload = {
            type: "entry_function_payload",
            function: `${marketplaceAddr}::NFTMarketplace::list_for_sale`,
            type_arguments: [],
            arguments: [
              marketplaceAddr,
              nft.id.toString(),
              (parseFloat(values.price) * 100000000).toString(),
            ],
          }
          break
        case "auction":
          payload = {
            type: "entry_function_payload",
            function: `${marketplaceAddr}::NFTMarketplace::create_auction`,
            type_arguments: [],
            arguments: [
              marketplaceAddr,
              nft.id.toString(),
              (parseFloat(values.startPrice) * 100000000).toString(),
              values.duration,
            ],
          }
          break
        case "transfer":
          payload = {
            type: "entry_function_payload",
            function: `${marketplaceAddr}::NFTMarketplace::transfer_ownership`,
            type_arguments: [],
            arguments: [marketplaceAddr, nft.id.toString(), values.recipient],
          }
          break
      }

      const response = await (window as any).aptos.signAndSubmitTransaction(
        payload,
      )
      await client.waitForTransaction(response.hash)

      message.success(`NFT ${selectedAction} successful!`)
      setIsModalVisible(false)
      form.resetFields()
      dispatch(refreshUserNFTsList(account.address))
    } catch (error) {
      console.error(`Error ${selectedAction}ing NFT:`, error)
      message.error(`Failed to ${selectedAction} NFT`)
      dispatch(refreshUserNFTsList(account.address))
    } finally {
      setLoading(false)
    }
  }

  const renderActionForm = () => {
    switch (selectedAction) {
      case "sell":
        return (
          <Form.Item
            name="price"
            label="Sale Price (APT)"
            rules={[{ required: true, message: "Please enter the sale price" }]}
          >
            <Input type="number" min={0} step={0.1} />
          </Form.Item>
        )
      case "auction":
        return (
          <>
            <Form.Item
              name="startPrice"
              label="Starting Price (APT)"
              rules={[
                { required: true, message: "Please enter the starting price" },
              ]}
            >
              <Input type="number" min={0} step={0.1} />
            </Form.Item>
            <Form.Item
              name="duration"
              label="Duration (seconds)"
              rules={[
                {
                  required: true,
                  message: "Please enter the auction duration",
                },
              ]}
            >
              <Input type="number" min={1} />
            </Form.Item>
          </>
        )
      case "transfer":
        return (
          <Form.Item
            name="recipient"
            label="Recipient Address"
            rules={[
              { required: true, message: "Please enter the recipient address" },
            ]}
          >
            <Input />
          </Form.Item>
        )
    }
  }

  return (
    <>
      <Card
        hoverable
        className="w-full max-w-[240px] mx-auto"
        cover={<img alt={nft.name} src={nft.uri} />}
        actions={[
          <Button type="link" onClick={() => handleActionClick(nft)}>
            Trade
          </Button>,
        ]}
      >
        <Tag
          color={rarityColors[nft.rarity]}
          className="text-sm font-bold mb-2"
        >
          {rarityLabels[nft.rarity]}
        </Tag>

        <Meta
          title={nft.name}
          description={
            nft.status ? `Listed for: ${nft.status} APT` : "Not for sale"
          }
        />
        <p>{nft.description}</p>
        <p>ID: {nft.id}</p>
        <p>Owner: {truncateAddress(nft.owner)}</p>
      </Card>

      <Modal
        title="NFT Action"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {nft && (
          <Form form={form} onFinish={handleAction} layout="vertical">
            <p>
              <strong>NFT ID:</strong> {nft.id}
            </p>
            <p>
              <strong>Name:</strong> {nft.name}
            </p>
            <p>
              <strong>Description:</strong> {nft.description}
            </p>
            <p>
              <strong>Rarity:</strong> {nft.rarity}
            </p>

            <Form.Item name="action" label="Select Action" initialValue="sell">
              <Select
                onChange={(value: selectedAction) => setSelectedAction(value)}
              >
                <Option value="sell">Sell NFT</Option>
                <Option value="auction">Auction NFT</Option>
                <Option value="transfer">Transfer NFT</Option>
              </Select>
            </Form.Item>

            {renderActionForm()}

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Confirm
                {selectedAction.charAt(0).toUpperCase() +
                  selectedAction.slice(1)}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  )
}

export default UserNFTCard
