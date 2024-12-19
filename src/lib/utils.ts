// src\lib\utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const truncateAddress = (address: string, start = 6, end = 4) => {
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

export const hexToUint8Array = (hexString: string): Uint8Array => {
  const bytes = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16)
  }
  return bytes
}

export const formatPrice = (price: string) => {
  return (parseInt(price) / 1000000).toFixed(2)
}
