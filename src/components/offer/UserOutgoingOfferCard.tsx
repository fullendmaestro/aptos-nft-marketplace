import React, { useState } from "react"
import { Card, Tag, Button, message, Statistic } from "antd"
import { NFT, Offer, OutgoinOffer } from "../../types"
import { truncateAddress } from "../../lib/utils"
import { rarityColors, rarityLabels } from "@/constants"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { cancelOffer } from "@/utils/aptosUtils"
import { useAppDispatch } from "../../store/hooks"
import { refreshUserOutgoingOffers } from "../../store/slices/offersSlice"

const { Meta } = Card
const { Countdown } = Statistic

interface UserOutgoingOfferCardProps {
  nft: OutgoinOffer
}

const UserOutgoingOfferCard: React.FC<UserOutgoingOfferCardProps> = ({
  nft,
}) => {
  const [loading, setLoading] = useState(false)
  const { account } = useWallet()
  const dispatch = useAppDispatch()

  const handleCancelOffer = async () => {
    if (!account) return

    setLoading(true)
    try {
      await cancelOffer(nft.id)
      message.success("Offer cancelled successfully!")
      dispatch(refreshUserOutgoingOffers(account.address))
    } catch (error) {
      console.error("Error cancelling offer:", error)
      message.error("Failed to cancel offer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      hoverable
      className="w-full max-w-[240px] mx-auto"
      cover={<img alt={nft.name} src={nft.uri} className="h-48 object-cover" />}
      actions={[
        <Button
          key="cancel"
          type="primary"
          danger
          onClick={handleCancelOffer}
          loading={loading}
        >
          Cancel Offer
        </Button>,
      ]}
    >
      <Tag color={rarityColors[nft.rarity]} className="text-sm font-bold mb-2">
        {rarityLabels[nft.rarity]}
      </Tag>

      <Meta
        title={nft.name}
        description={`Offer: ${nft.offer.price / 100000000} APT`}
      />
      <p className="mt-2 text-sm">{nft.description}</p>
      <p className="text-sm">ID: {nft.id}</p>
      <p className="text-sm">Owner: {truncateAddress(nft.owner)}</p>
      <p className="text-sm">
        <Countdown
          title={<span className="text-lg font-semibold">Expires:</span>}
          value={nft.offer.expiration_time * 1000}
          format="D [days] H [hrs] m [mins] s [secs]"
          className="text-center"
        />
        Expires on:
        {new Date(nft.offer.expiration_time * 1000).toLocaleString()}
      </p>
    </Card>
  )
}

export default UserOutgoingOfferCard
