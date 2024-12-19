// src\components\offer\OfferCard.tsx
import React, { useState } from "react"
import { Card, Tag, Button } from "antd"
import { OfferData } from "../../types"
import { rarityColors, rarityLabels } from "@/constants"
import AcceptOfferModal from "./AcceptOfferModal"
import { truncateAddress } from "@/lib/utils"

const { Meta } = Card

interface OfferCardProps {
  offer: OfferData
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)
  const handleCancel = () => setIsModalVisible(false)
  const handleOfferAccepted = () => {
    // Refresh offer data or update UI as needed
  }

  return (
    <>
      <Card
        hoverable
        className="w-full max-w-[240px] mx-auto"
        cover={<img alt={offer.nft_detail.name} src={offer.nft_detail.uri} />}
        actions={[
          <Button type="primary" onClick={showModal}>
            Accept Offer
          </Button>,
        ]}
      >
        <Tag
          color={rarityColors[offer.nft_detail.rarity]}
          className="text-sm font-bold mb-2"
        >
          {rarityLabels[offer.nft_detail.rarity]}
        </Tag>

        <Meta
          title={offer.nft_detail.name}
          description={`Offer: ${offer.price} APT`}
        />
        <p>{offer.nft_detail.description}</p>
        <p>ID: {offer.nft_detail.id}</p>
        <p>Buyer: {truncateAddress(offer.buyer)}</p>
        <p>
          Expires: {new Date(offer.expiration_time * 1000).toLocaleString()}
        </p>
      </Card>
      <AcceptOfferModal
        visible={isModalVisible}
        offer={offer}
        onCancel={handleCancel}
        onOfferAccepted={handleOfferAccepted}
      />
    </>
  )
}

export default OfferCard
