import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NFT, mockNFTs } from "@/lib/mockData";

interface NFTState {
  marketplaceNFTs: NFT[];
  userNFTs: NFT[];
  selectedNFT: NFT | null;
}

const initialState: NFTState = {
  marketplaceNFTs: mockNFTs.filter((nft) => nft.for_sale),
  userNFTs: mockNFTs.filter((nft) => nft.owner === "0x1234...5678"), // Simulating owned NFTs
  selectedNFT: null,
};

export const nftSlice = createSlice({
  name: "nft",
  initialState,
  reducers: {
    setMarketplaceNFTs: (state, action: PayloadAction<NFT[]>) => {
      state.marketplaceNFTs = action.payload;
    },
    setUserNFTs: (state, action: PayloadAction<NFT[]>) => {
      state.userNFTs = action.payload;
    },
    setSelectedNFT: (state, action: PayloadAction<NFT | null>) => {
      state.selectedNFT = action.payload;
    },
    updateNFT: (state, action: PayloadAction<NFT>) => {
      state.marketplaceNFTs = state.marketplaceNFTs.map((nft) =>
        nft.id === action.payload.id ? action.payload : nft
      );
      state.userNFTs = state.userNFTs.map((nft) =>
        nft.id === action.payload.id ? action.payload : nft
      );
    },
  },
});

export const { setMarketplaceNFTs, setUserNFTs, setSelectedNFT, updateNFT } =
  nftSlice.actions;

export default nftSlice.reducer;
