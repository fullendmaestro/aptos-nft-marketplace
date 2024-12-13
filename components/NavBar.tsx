"use client";

import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { truncateAddress } from "@/lib/mockData";

export default function NavBar() {
  const { account, connect, disconnect } = useWallet();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link href="/" className="flex items-center py-4 px-2">
                <span className="font-semibold text-gray-500 text-lg">
                  NFT Marketplace
                </span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-gray-100 hover:text-gray-900 transition duration-300"
            >
              Home
            </Link>
            <Link
              href="/my-nfts"
              className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-gray-100 hover:text-gray-900 transition duration-300"
            >
              My NFTs
            </Link>
            {account ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {truncateAddress(account.address)}
                </span>
                <button
                  onClick={disconnect}
                  className="py-2 px-2 font-medium text-white bg-red-500 rounded hover:bg-red-400 transition duration-300"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="py-2 px-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-400 transition duration-300"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
