import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { NFT, ListedNFT } from "../../types"
import {
  fetchAvailableNFTs,
  fetchListedNFTs,
  fetchUserNFTs,
} from "../../utils/aptosUtils"

interface NFTsState {
  availableNFTs: NFT[]
  listedNFTs: ListedNFT[]
  userNFTs: NFT[]
  loading: boolean
  error: string | null
}

const initialState: NFTsState = {
  availableNFTs: [],
  listedNFTs: [],
  userNFTs: [],
  loading: false,
  error: null,
}

export const fetchAvailableNFTsList = createAsyncThunk(
  "nfts/fetchAvailableNFTs",
  async () => {
    const nfts = await fetchAvailableNFTs()
    return nfts
  },
)

export const fetchListedNFTsList = createAsyncThunk(
  "nfts/fetchListedNFTs",
  async () => {
    const nfts = await fetchListedNFTs()
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

export const refreshAvailableNFTsList = createAsyncThunk(
  "nfts/refreshAvailableNFTs",
  async () => {
    const nfts = await fetchAvailableNFTs()
    return nfts
  },
)

export const refreshListedNFTsList = createAsyncThunk(
  "nfts/refreshListedNFTs",
  async () => {
    const nfts = await fetchListedNFTs()
    return nfts
  },
)

export const refreshUserNFTsList = createAsyncThunk(
  "nfts/refreshUserNFTs",
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
      .addCase(fetchAvailableNFTsList.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailableNFTsList.fulfilled, (state, action) => {
        state.loading = false
        state.availableNFTs = action.payload
      })
      .addCase(fetchAvailableNFTsList.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch available NFTs"
      })
      .addCase(fetchListedNFTsList.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchListedNFTsList.fulfilled, (state, action) => {
        state.loading = false
        state.listedNFTs = action.payload
      })
      .addCase(fetchListedNFTsList.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch listed NFTs"
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
      .addCase(refreshAvailableNFTsList.fulfilled, (state, action) => {
        state.availableNFTs = action.payload
      })
      .addCase(refreshListedNFTsList.fulfilled, (state, action) => {
        state.listedNFTs = action.payload
      })
      .addCase(refreshUserNFTsList.fulfilled, (state, action) => {
        state.userNFTs = action.payload
      })
  },
})

export default nftsSlice.reducer
