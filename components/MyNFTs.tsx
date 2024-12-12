"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { NFT, rarityLabels } from "@/lib/mockData";
import { RootState } from "@/lib/store";
import { setSelectedNFT, updateNFT } from "@/lib/nftSlice";
import NFTGrid from "./NFTGrid";
import Pagination from "./Pagination";

const pageSize = 8;

export default function MyNFTs() {
  const dispatch = useDispatch();
  const { account } = useWallet();
  const { userNFTs, selectedNFT } = useSelector(
    (state: RootState) => state.nft
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [salePrice, setSalePrice] = useState<string>("");

  const handleSellClick = (nft: NFT) => {
    dispatch(setSelectedNFT(nft));
    setSalePrice("");
  };

  const handleConfirmListing = async () => {
    if (!selectedNFT || !salePrice || !account) return;

    // Simulating listing process with mocked data
    const updatedNFT = {
      ...selectedNFT,
      price: parseFloat(salePrice),
      for_sale: true,
    };
    dispatch(updateNFT(updatedNFT));
    dispatch(setSelectedNFT(null));
    setSalePrice("");
    alert(`NFT ${selectedNFT.id} listed for sale at ${salePrice} APT`);
  };

  const paginatedNFTs = userNFTs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-8">My Collection</h2>
      <p className="mb-8">Your personal collection of NFTs.</p>

      <NFTGrid
        nfts={paginatedNFTs}
        onActionClick={handleSellClick}
        actionLabel="Sell"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(userNFTs.length / pageSize)}
        onPageChange={setCurrentPage}
      />

      {selectedNFT && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="my-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Sell NFT
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Name: {selectedNFT.name}
                  <br />
                  Description: {selectedNFT.description}
                  <br />
                  Rarity: {rarityLabels[selectedNFT.rarity]}
                  <br />
                  Current Price: {selectedNFT.price} APT
                </p>
                <input
                  type="number"
                  placeholder="Enter sale price in APT"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="mt-4 w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleConfirmListing}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Confirm Listing
                </button>
                <button
                  onClick={() => dispatch(setSelectedNFT(null))}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
