// src\components\common\PurchaseModal.tsx
import React from "react"
import { Modal, Button } from "antd"
import { NFT } from "../../types"
import { truncateAddress } from "../../lib/utils"
import { rarityLabels } from "@/constants"

interface PurchaseModalProps {
  visible: boolean
  nft: NFT | null
  onCancel: () => void
  onConfirm: () => void
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  visible,
  nft,
  onCancel,
  onConfirm,
}) => (
  <Modal
    title="Purchase NFT"
    visible={visible}
    onCancel={onCancel}
    footer={[
      <Button key="cancel" onClick={onCancel}>
        Cancel
      </Button>,
      <Button key="confirm" type="primary" onClick={onConfirm}>
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

export default PurchaseModal
