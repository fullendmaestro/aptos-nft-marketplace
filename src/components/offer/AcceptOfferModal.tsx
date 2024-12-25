import React, { useState } from "react"
import { Modal, List, Button, message } from "antd"
import { NFTWithDetails, Offer } from "../../types"
import { acceptOffer } from "../../utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { truncateAddress } from "@/lib/utils"
import { useAppDispatch } from "../../store/hooks"
import { refreshUserNFTsList } from "../../store/slices/nftsSlice"
import { refreshUserIncomingOffers } from "../../store/slices/offersSlice"

interface AcceptOfferModalProps {
  visible: boolean
  nft: NFTWithDetails
  onCancel: () => void
  onSuccess: () => void
}

const AcceptOfferModal: React.FC<AcceptOfferModalProps> = ({
  visible,
  nft,
  onCancel,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)
  const { account } = useWallet()
  const dispatch = useAppDispatch()
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)

  const handleAcceptOffer = async (offer: Offer) => {
    if (!account) return

    setLoading(true)
    try {
      await acceptOffer(nft.id, offer.buyer)
      message.success("Offer accepted successfully")
      dispatch(refreshUserNFTsList(account.address))
      dispatch(refreshUserIncomingOffers(account.address))
      onSuccess()
    } catch (error) {
      console.error("Error accepting offer:", error)
      message.error("Failed to accept offer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Active Offers"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      {nft.offers && nft.offers.length > 0 ? (
        <List
          dataSource={nft.offers.filter(o => o.is_active)}
          renderItem={offer => (
            <List.Item
              actions={[
                <Button
                  key="accept"
                  type="primary"
                  onClick={() => handleAcceptOffer(offer)}
                  loading={loading && selectedOffer?.buyer === offer.buyer}
                >
                  Accept
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={`${offer.price / 100000000} APT`}
                description={
                  <>
                    <p>From: {truncateAddress(offer.buyer)}</p>
                    <p>
                      Expires:{" "}
                      {new Date(offer.expiration_time * 1000).toLocaleString()}
                    </p>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <p>No active offers available</p>
      )}
    </Modal>
  )
}

export default AcceptOfferModal
