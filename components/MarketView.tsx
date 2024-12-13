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

export default function MarketView() {
  const dispatch = useDispatch();
  const { account } = useWallet();
  const { marketplaceNFTs, selectedNFT } = useSelector(
    (state: RootState) => state.nft
  );
  const [currentPage, setCurrentPage] = useState(1);

  const handleBuyClick = (nft: NFT) => {
    dispatch(setSelectedNFT(nft));
  };

  const handleConfirmPurchase = async () => {
    if (!selectedNFT || !account) return;

    // Simulating purchase process with mocked data
    const updatedNFT = {
      ...selectedNFT,
      owner: account.address,
      for_sale: false,
    };
    dispatch(updateNFT(updatedNFT));
    dispatch(setSelectedNFT(null));
    alert(`NFT ${selectedNFT.id} purchased successfully!`);
  };

  const paginatedNfts = marketplaceNFTs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-8">Marketplace</h2>

      <NFTGrid
        nfts={paginatedNfts}
        onActionClick={handleBuyClick}
        actionLabel="Buy"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(marketplaceNFTs.length / pageSize)}
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
                Purchase NFT
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Name: {selectedNFT.name}
                  <br />
                  Description: {selectedNFT.description}
                  <br />
                  Rarity: {rarityLabels[selectedNFT.rarity]}
                  <br />
                  Price: {selectedNFT.price} APT
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleConfirmPurchase}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Confirm Purchase
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
