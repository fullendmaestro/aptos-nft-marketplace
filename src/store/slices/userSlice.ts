import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserState {
  selectedRarity: number | "all"
  viewType: "nfts" | "auctions" | "offers"
}

const initialState: UserState = {
  selectedRarity: "all",
  viewType: "nfts",
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSelectedRarity: (state, action: PayloadAction<number | "all">) => {
      state.selectedRarity = action.payload
    },
    setViewType: (
      state,
      action: PayloadAction<"nfts" | "auctions" | "offers">,
    ) => {
      state.viewType = action.payload
    },
  },
})

export const { setSelectedRarity, setViewType } = userSlice.actions
export default userSlice.reducer
