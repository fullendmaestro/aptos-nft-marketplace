import { configureStore } from "@reduxjs/toolkit"
import nftsReducer from "./slices/nftsSlice"
import auctionsReducer from "./slices/auctionsSlice"
import offersReducer from "./slices/offersSlice"
import userReducer from "./slices/userSlice"

export const store = configureStore({
  reducer: {
    nfts: nftsReducer,
    auctions: auctionsReducer,
    offers: offersReducer,
    user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
