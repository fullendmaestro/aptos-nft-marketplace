// src\types\index.ts
import { Types } from "aptos"

export type NFTStatus = "available" | "listed" | "in_auction" | "has_offers"

export type NFT = {
  id: number
  owner: string
  name: string
  description: string
  uri: string
  rarity: number
}

export type OwnedNFT = NFT & {
  status: NFTStatus
}

export type ListedNFT = {
  id: number
  owner: string
  name: string
  description: string
  uri: string
  price: number
  for_sale: boolean
  rarity: number
}

export type Auction = {
  nft_id: number
  seller: string
  start_price: number
  current_bid: number
  highest_bidder: string
  end_time: number
  is_active: boolean
}

export type Offer = {
  nft_id: number
  buyer: string
  price: number
  expiration_time: number
  is_active: boolean
}

export type NFTWithDetails = NFT & {
  status: NFTStatus
  price?: number
  auction?: Auction
  offers?: Offer[]
}

export type AuctionData = {
  id: number
  owner: string
  name: string
  description: string
  uri: string
  rarity: number
  status: string
  auction: Auction
}

export type OfferData = NFT & {
  offers: Offer[]
}

export type MarketplaceTab = "available" | "listed" | "auctions"
export type MyNFTsTab = "owned" | "in-auction" | "offers"
