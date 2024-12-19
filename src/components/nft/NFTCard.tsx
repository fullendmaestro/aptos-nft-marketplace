import React, { useState } from "react"
import { Card, Tag, Button } from "antd"

import { rarityColors, rarityLabels } from "@/constants"
import { truncateAddress } from "@/lib/utils"
import { NFT } from "@/types"
import CreateOfferModal from "../offer/CreateOfferModal"

const { Meta } = Card

interface NFTCardProps {
  nft: NFT
  onBuyClick: (nft: NFT) => void
  onNFTClick: (nft: NFT) => void
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, onBuyClick, onNFTClick }) => {
  console.log("nft", nft)
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false)

  const handleCreateOffer = () => {
    setIsOfferModalVisible(true)
  }

  const handleOfferModalCancel = () => {
    setIsOfferModalVisible(false)
  }

  const handleOfferCreated = () => {
    setIsOfferModalVisible(false)
    // Refresh NFT list if needed
  }

  return (
    <>
      <Card
        hoverable
        className="w-full max-w-[240px] mx-auto"
        cover={
          <img alt={nft.name} src={nft.uri} onClick={() => onNFTClick(nft)} />
        }
        actions={[
          <Button key="offer" type="link" onClick={handleCreateOffer}>
            Make Offer
          </Button>,
        ].filter(Boolean)}
      >
        <Tag
          color={rarityColors[nft.rarity]}
          className="text-sm font-bold mb-2"
        >
          {rarityLabels[nft.rarity]}
        </Tag>

        <Meta
          title={nft.name}
          description={nft.status ? `Status: ${nft.status}` : "Not for sale"}
        />
        <p>{nft.description}</p>
        <p>ID: {nft.id}</p>
        <p>Owner: {truncateAddress(nft.owner)}</p>
      </Card>

      <CreateOfferModal
        visible={isOfferModalVisible}
        nft={nft}
        onCancel={handleOfferModalCancel}
        onOfferCreated={handleOfferCreated}
      />
    </>
  )
}

export default NFTCard
