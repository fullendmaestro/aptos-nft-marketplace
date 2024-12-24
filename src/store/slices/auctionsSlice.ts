import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { AuctionData } from "../../types"
import { fetchAuctions, fetchUserAuctions } from "../../utils/aptosUtils"

interface AuctionsState {
  marketplaceAuctions: AuctionData[]
  userAuctions: AuctionData[]
  loading: boolean
  error: string | null
}

const initialState: AuctionsState = {
  marketplaceAuctions: [],
  userAuctions: [],
  loading: false,
  error: null,
}

export const fetchMarketplaceAuctions = createAsyncThunk(
  "auctions/fetchMarketplaceAuctions",
  async (rarity: number | undefined) => {
    const auctions = await fetchAuctions(rarity)
    return auctions
  },
)

export const fetchUserAuctionsList = createAsyncThunk(
  "auctions/fetchUserAuctions",
  async (userAddress: string) => {
    const auctions = await fetchUserAuctions(userAddress)
    return auctions
  },
)

const auctionsSlice = createSlice({
  name: "auctions",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMarketplaceAuctions.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMarketplaceAuctions.fulfilled, (state, action) => {
        state.loading = false
        state.marketplaceAuctions = action.payload
      })
      .addCase(fetchMarketplaceAuctions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch auctions"
      })
      .addCase(fetchUserAuctionsList.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserAuctionsList.fulfilled, (state, action) => {
        state.loading = false
        state.userAuctions = action.payload
      })
      .addCase(fetchUserAuctionsList.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch user auctions"
      })
  },
})

export default auctionsSlice.reducer
