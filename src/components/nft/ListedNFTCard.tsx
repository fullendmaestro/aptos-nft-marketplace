// src\components\nft\ListedNFTCard.tsx
import React, { useState } from "react"
import { Card, Tag, Button, message } from "antd"

import { rarityColors, rarityLabels } from "@/constants"
import { truncateAddress } from "@/lib/utils"
import { ListedNFT, NFT } from "@/types"
import PurchaseNFTModal from "./PurchaseNFTModal"
import { purchaseNFT } from "@/utils/aptosUtils"

const { Meta } = Card

interface ListedNFTCardProps {
  listing: ListedNFT
}

const ListedNFTCard: React.FC<ListedNFTCardProps> = ({ listing }) => {
  console.log("listed nft", listing)
  const [isBuyModalVisible, setIsBuyModalVisible] = useState(false)
  const handleBuyClick = (nft: ListedNFT) => {
    setIsBuyModalVisible(true)
  }

  const handleCancelBuy = () => {
    setIsBuyModalVisible(false)
  }

  const handleConfirmPurchase = async () => {
    setIsBuyModalVisible(false)
  }

  return (
    <>
      <Card
        hoverable
        className="w-full max-w-[240px] mx-auto"
        cover={<img alt={listing.name} src={listing.uri} />}
        actions={[
          <Button type="link" onClick={() => handleBuyClick(listing)}>
            Buy
          </Button>,
        ].filter(Boolean)}
      >
        <Tag
          color={rarityColors[listing.rarity]}
          className="text-sm font-bold mb-2"
        >
          {rarityLabels[listing.rarity]}
        </Tag>

        <Meta
          title={listing.name}
          description={
            listing.price ? `Status: ${listing.price}` : "Not for sale"
          }
        />
        <p>{listing.description}</p>
        <p>ID: {listing.id}</p>
        <p>Owner: {truncateAddress(listing.owner)}</p>
      </Card>

      <PurchaseNFTModal
        visible={isBuyModalVisible}
        nft={listing}
        onCancel={handleCancelBuy}
        onSuccess={handleConfirmPurchase}
      />
    </>
  )
}

export default ListedNFTCard
