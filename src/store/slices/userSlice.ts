import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserState {
  selectedRarity: number | "all"
  viewType: "available" | "auctions" | "offers" | "listed"
}

const initialState: UserState = {
  selectedRarity: "all",
  viewType: "available",
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
      action: PayloadAction<"available" | "listed" | "auctions">,
    ) => {
      state.viewType = action.payload
    },
  },
})

export const { setSelectedRarity, setViewType } = userSlice.actions
export default userSlice.reducer
