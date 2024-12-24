import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { OfferData } from "../../types"
import { fetchOffers, fetchIncomingOffers } from "../../utils/aptosUtils"

interface OffersState {
  marketplaceOffers: OfferData[]
  incomingOffers: OfferData[]
  loading: boolean
  error: string | null
}

const initialState: OffersState = {
  marketplaceOffers: [],
  incomingOffers: [],
  loading: false,
  error: null,
}

export const fetchMarketplaceOffers = createAsyncThunk(
  "offers/fetchMarketplaceOffers",
  async (rarity: number | undefined) => {
    const offers = await fetchOffers(rarity)
    return offers
  },
)

export const fetchUserIncomingOffers = createAsyncThunk(
  "offers/fetchUserIncomingOffers",
  async (userAddress: string) => {
    const offers = await fetchIncomingOffers(userAddress)
    return offers
  },
)

const offersSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMarketplaceOffers.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMarketplaceOffers.fulfilled, (state, action) => {
        state.loading = false
        state.marketplaceOffers = action.payload
      })
      .addCase(fetchMarketplaceOffers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch offers"
      })
      .addCase(fetchUserIncomingOffers.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserIncomingOffers.fulfilled, (state, action) => {
        state.loading = false
        state.incomingOffers = action.payload
      })
      .addCase(fetchUserIncomingOffers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch incoming offers"
      })
  },
})

export default offersSlice.reducer
