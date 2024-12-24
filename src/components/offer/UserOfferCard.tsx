// src\components\offer\UserOfferCard.tsx
import React, { useState } from "react"
import { Card, Tag, Button, message, List, Typography, Modal } from "antd"
import { NFT, Offer, OfferData } from "../../types"
import { truncateAddress } from "../../lib/utils"
import { rarityColors, rarityLabels } from "@/constants"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { acceptOffer, client } from "@/utils/aptosUtils"

const { Meta } = Card
const { Text } = Typography

interface UserOfferCardProps {
  offer: OfferData
}

const UserOfferCard: React.FC<UserOfferCardProps> = ({ offer }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const { account } = useWallet()

  const handleAcceptOffer = async (offer: Offer) => {
    if (!account) return

    setLoading(offer.nft_id)
    try {
      await acceptOffer(offer.nft_id, offer.buyer)
      message.success("Offer accepted successfully!")
    } catch (error) {
      console.error("Error accepting offer:", error)
      message.error("Failed to accept offer")
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card
      hoverable
      className="w-full max-w-[300px] mx-auto"
      cover={
        <img alt={offer.name} src={offer.uri} className="h-48 object-cover" />
      }
      actions={[
        <Button type="link" onClick={() => setIsModalVisible(true)}>
          View Details
        </Button>,
      ]}
    >
      <Tag
        color={rarityColors[offer.rarity]}
        className="text-sm font-bold mb-2"
      >
        {rarityLabels[offer.rarity]}
      </Tag>

      <Meta title={offer.name} description={offer.description} />
      <p className="mt-2 text-sm">ID: {offer.id}</p>
      <p className="text-sm">Owner: {truncateAddress(offer.owner)}</p>
      <p className="text-sm">Offers: {offer.offers.length}</p>

      <Modal
        title={`Offers for ${offer.name}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <List
          className="mt-4"
          header={<div>Offers</div>}
          itemLayout="horizontal"
          dataSource={offer.offers}
          renderItem={offer => (
            <List.Item
              actions={[
                <Button
                  key="accept"
                  type="primary"
                  size="small"
                  onClick={() => handleAcceptOffer(offer)}
                  loading={loading === offer.nft_id}
                >
                  Accept
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<Text>{parseFloat(offer.price) / 100000000} APT</Text>}
                description={
                  <>
                    <Text>Buyer: {truncateAddress(offer.buyer)}</Text>
                    <br />
                    <Text>
                      Expires:{" "}
                      {new Date(
                        parseInt(offer.expiration_time) * 1000,
                      ).toLocaleString()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </Card>
  )
}

export default UserOfferCard
