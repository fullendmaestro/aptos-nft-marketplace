import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { NFT, OfferData } from "../../types"
import {
  fetchIncomingOffers,
  fetchOutgoingOffers,
} from "../../utils/aptosUtils"

interface OffersState {
  incomingOffers: OfferData[]
  outgoingOffers: NFT[]
  loading: boolean
  error: string | null
}

const initialState: OffersState = {
  incomingOffers: [],
  outgoingOffers: [],
  loading: false,
  error: null,
}

export const fetchUserIncomingOffers = createAsyncThunk(
  "offers/fetchUserIncomingOffers",
  async (userAddress: string) => {
    const offers = await fetchIncomingOffers(userAddress)
    return offers
  },
)

export const fetchUserOutgoingOffers = createAsyncThunk(
  "offers/fetchUserOutgoingOffers",
  async (userAddress: string) => {
    const offers = await fetchOutgoingOffers(userAddress)
    return offers
  },
)

export const refreshUserIncomingOffers = createAsyncThunk(
  "offers/refreshUserIncomingOffers",
  async (userAddress: string) => {
    const offers = await fetchIncomingOffers(userAddress)
    return offers
  },
)

export const refreshUserOutgoingOffers = createAsyncThunk(
  "offers/refreshUserOutgoingOffers",
  async (userAddress: string) => {
    const offers = await fetchOutgoingOffers(userAddress)
    return offers
  },
)

const offersSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
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
      .addCase(fetchUserOutgoingOffers.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserOutgoingOffers.fulfilled, (state, action) => {
        state.loading = false
        state.outgoingOffers = action.payload
      })
      .addCase(fetchUserOutgoingOffers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch outgoing offers"
      })
      .addCase(refreshUserIncomingOffers.fulfilled, (state, action) => {
        state.incomingOffers = action.payload
      })
      .addCase(refreshUserOutgoingOffers.fulfilled, (state, action) => {
        state.outgoingOffers = action.payload
      })
  },
})

export default offersSlice.reducer
