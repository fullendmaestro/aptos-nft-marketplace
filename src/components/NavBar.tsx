// src\components\Navbar.tsx
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Layout,
  Typography,
  Space,
  Button,
  Dropdown,
  message,
  Menu,
} from "antd"
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design"
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { AptosClient } from "aptos"
import { DownOutlined, LogoutOutlined } from "@ant-design/icons"
import { truncateAddress } from "@/lib/utils"
import { tesnetaddr } from "@/constants"

const { Header } = Layout
const { Text } = Typography

const client = new AptosClient(tesnetaddr)

interface NavBarProps {
  onMintNFTClick: () => void
}

const NavBar: React.FC<NavBarProps> = ({ onMintNFTClick }) => {
  const { connected, account, network, disconnect } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      if (account) {
        try {
          const resources = await client.getAccountResources(account.address)
          const accountResource = resources.find(
            r => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
          )
          if (accountResource) {
            const balanceValue = (accountResource.data as any).coin.value
            setBalance(balanceValue ? parseInt(balanceValue) / 100000000 : 0)
          } else {
            setBalance(0)
          }
        } catch (error) {
          console.error("Error fetching balance:", error)
        }
      }
    }

    if (connected) {
      fetchBalance()
    }
  }, [account, connected])

  const handleLogout = async () => {
    try {
      await disconnect()
      setBalance(null)
      message.success("Disconnected from wallet")
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
      message.error("Failed to disconnect from wallet")
    }
  }

  return (
    <Header className="flex justify-between items-center bg-gray-800 px-6 h-16">
      <img src="/Aptos_Primary_WHT.png" alt="Aptos Logo" className="h-8 mr-6" />
      <div className="flex items-center">
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="text-white hover:text-gray-300 transition-colors"
          >
            Marketplace
          </Link>
          <Link
            to="/my-nfts"
            className="text-white hover:text-gray-300 transition-colors"
          >
            My Collection
          </Link>
          <button
            onClick={onMintNFTClick}
            className="text-white hover:text-gray-300 transition-colors"
          >
            Mint NFT
          </button>
        </div>
        <div className="w-5"></div>
        <Space className="items-center">
          {connected && account ? (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="address">
                    <Text strong>Address:</Text> <br />
                    <Text copyable>{account.address}</Text>
                  </Menu.Item>
                  <Menu.Item key="network">
                    <Text strong>Network:</Text>{" "}
                    {network ? network.name : "Unknown"}
                  </Menu.Item>
                  <Menu.Item key="balance">
                    <Text strong>Balance:</Text>{" "}
                    {balance !== null ? `${balance} APT` : "Loading..."}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    key="logout"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                  >
                    Log Out
                  </Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
              <Button type="primary">
                Connected <DownOutlined />
              </Button>
            </Dropdown>
          ) : (
            <WalletSelector />
          )}
        </Space>
      </div>
    </Header>
  )
}

export default NavBar
