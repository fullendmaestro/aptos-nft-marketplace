import React from "react"
import { Modal, Button, message } from "antd"
import { ListedNFT } from "../../types"
import { purchaseNFT } from "../../utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { rarityLabels } from "@/constants"
import { truncateAddress } from "@/lib/utils"
import { useAppDispatch } from "../../store/hooks"
import {
  refreshAvailableNFTsList,
  refreshUserNFTsList,
} from "../../store/slices/nftsSlice"

interface PurchaseModalProps {
  visible: boolean
  nft: ListedNFT
  onCancel: () => void
  onSuccess: () => void
}

const PurchaseNFTModal: React.FC<PurchaseModalProps> = ({
  visible,
  nft,
  onCancel,
  onSuccess,
}) => {
  const { account } = useWallet()
  const dispatch = useAppDispatch()

  const handleConfirmPurchase = async () => {
    if (!account) {
      message.error("Please connect your wallet")
      return
    }

    try {
      await purchaseNFT(nft)
      message.success("NFT purchased successfully!")
      dispatch(refreshAvailableNFTsList())
      dispatch(refreshUserNFTsList(account.address))
      onSuccess()
    } catch (error) {
      console.error("Error purchasing NFT:", error)
      message.error("Failed to purchase NFT")
    }
  }

  return (
    <Modal
      title="Purchase NFT"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirmPurchase}>
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
