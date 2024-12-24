import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { NFT } from "../../types"
import { fetchNFTs, fetchUserNFTs } from "../../utils/aptosUtils"

interface NFTsState {
  marketplaceNFTs: NFT[]
  userNFTs: NFT[]
  loading: boolean
  error: string | null
}

const initialState: NFTsState = {
  marketplaceNFTs: [],
  userNFTs: [],
  loading: false,
  error: null,
}

export const fetchMarketplaceNFTs = createAsyncThunk(
  "nfts/fetchMarketplaceNFTs",
  async (rarity: number | undefined) => {
    const nfts = await fetchNFTs(rarity)
    return nfts
  },
)

export const fetchUserNFTsList = createAsyncThunk(
  "nfts/fetchUserNFTs",
  async (userAddress: string) => {
    const nfts = await fetchUserNFTs(userAddress)
    return nfts
  },
)

const nftsSlice = createSlice({
  name: "nfts",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMarketplaceNFTs.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMarketplaceNFTs.fulfilled, (state, action) => {
        state.loading = false
        state.marketplaceNFTs = action.payload
      })
      .addCase(fetchMarketplaceNFTs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch NFTs"
      })
      .addCase(fetchUserNFTsList.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserNFTsList.fulfilled, (state, action) => {
        state.loading = false
        state.userNFTs = action.payload
      })
      .addCase(fetchUserNFTsList.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch user NFTs"
      })
  },
})

export default nftsSlice.reducer
