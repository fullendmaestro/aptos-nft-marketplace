import React from "react"
import { List, Card, Button, Typography, Modal } from "antd"
import { OfferData } from "@/types"
import { cancelOffer } from "@/utils/aptosUtils"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

const { Text } = Typography

interface OutgoingOffersListProps {
  offers: OfferData[]
  onOfferCancelled: () => void
}

const OutgoingOffersList: React.FC<OutgoingOffersListProps> = ({
  offers,
  onOfferCancelled,
}) => {
  const { account } = useWallet()

  const handleCancelOffer = async (nftId: number) => {
    if (!account) return

    try {
      await cancelOffer(nftId)
      onOfferCancelled()
    } catch (error) {
      console.error("Error cancelling offer:", error)
      Modal.error({
        title: "Error",
        content: "Failed to cancel the offer. Please try again.",
      })
    }
  }

  return (
    <List
      grid={{ gutter: 16, column: 2 }}
      dataSource={offers}
      renderItem={item => (
        <List.Item>
          <Card
            title={item.name}
            extra={
              <img
                src={item.uri}
                alt={item.name}
                style={{ width: 50, height: 50 }}
              />
            }
            actions={[
              <Button
                onClick={() => handleCancelOffer(item.id)}
                type="primary"
                danger
              >
                Cancel Offer
              </Button>,
            ]}
          >
            <Text>Description: {item.description}</Text>
            <br />
            <Text>Offer Price: {item.offers[0]?.price} APT</Text>
          </Card>
        </List.Item>
      )}
    />
  )
}

export default OutgoingOffersList
