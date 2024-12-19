import React, { useState } from "react"
import { Modal, Form, Input, Button, message } from "antd"
import { ListedNFT, NFTWithDetails } from "../../types"
import { createOffer } from "../../utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { rarityLabels } from "@/constants"
import { truncateAddress } from "@/lib/utils"
import { on } from "events"

interface CreateOfferModalProps {
  visible: boolean
  nft: ListedNFT
  onCancel: () => void
  onSuccess: () => void
}

const PurchaseNFTModal: React.FC<CreateOfferModalProps> = ({
  visible,
  nft,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm()
  const { account } = useWallet()

  return (
    <Modal
      title="Purchase NFT"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="confirm" type="primary" onClick={onSuccess}>
          Confirm Purchase
        </Button>,
      ]}
    >
      {nft && (
        <>
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
            <strong>Rarity:</strong> {rarityLabels[nft.rarity]}
          </p>
          <p>
            <strong>Price:</strong> {nft.price} APT
          </p>
          <p>
            <strong>Owner:</strong> {truncateAddress(nft.owner)}
          </p>
        </>
      )}
    </Modal>
  )
}

export default PurchaseNFTModal
