// src\App.tsx
import React, { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Layout, Modal, Form, Input, Select, Button, message } from "antd"

import NavBar from "./components/NavBar"
import MarketView from "./pages/MarketView"
import MyNFTs from "./pages/MyNFTs"
import { marketplaceAddr, moduleName } from "./constants"
import { client } from "./utils/aptosUtils"
import Home from "./pages/Home"
import { useAppDispatch } from "./store/hooks"
import {
  refreshListedNFTsList,
  refreshUserNFTsList,
} from "./store/slices/nftsSlice"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

function App() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const dispatch = useAppDispatch()

  const { connected, account } = useWallet()

  const handleMintNFTClick = () => setIsModalVisible(true)

  const handleMintNFT = async (values: {
    name: string
    description: string
    uri: string
    rarity: number
  }) => {
    try {
      const nameVector = Array.from(new TextEncoder().encode(values.name))
      const descriptionVector = Array.from(
        new TextEncoder().encode(values.description),
      )
      const uriVector = Array.from(new TextEncoder().encode(values.uri))

      const entryFunctionPayload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::${moduleName}::mint_nft`,
        type_arguments: [],
        arguments: [
          marketplaceAddr,
          nameVector,
          descriptionVector,
          uriVector,
          values.rarity,
        ],
      }

      const txnResponse = await (window as any).aptos.signAndSubmitTransaction(
        entryFunctionPayload,
      )
      await client.waitForTransaction(txnResponse.hash)
      dispatch(refreshListedNFTsList())
      if (account) {
        dispatch(refreshUserNFTsList(account.address))
      }
      message.success("NFT minted successfully!")
      setIsModalVisible(false)
    } catch (error) {
      console.error("Error minting NFT:", error)
      message.error("Failed to mint NFT.")
    }
  }

  return (
    <Router>
      <Layout className="min-h-screen">
        <NavBar onMintNFTClick={handleMintNFTClick} />
        <Layout.Content className="p-6">
          <Routes>
            <Route path="/" element={<MarketView />} />
            <Route path="/home" element={<Home />} />
            <Route path="/my-nfts" element={<MyNFTs />} />
          </Routes>
        </Layout.Content>
        <Modal
          title="Mint New NFT"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form layout="vertical" onFinish={handleMintNFT}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter a name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: "Please enter a description!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="URI"
              name="uri"
              rules={[{ required: true, message: "Please enter a URI!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Rarity"
              name="rarity"
              rules={[{ required: true, message: "Please select a rarity!" }]}
            >
              <Select>
                <Select.Option value={1}>Common</Select.Option>
                <Select.Option value={2}>Uncommon</Select.Option>
                <Select.Option value={3}>Rare</Select.Option>
                <Select.Option value={4}>Epic</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Mint NFT
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </Router>
  )
}

export default App
