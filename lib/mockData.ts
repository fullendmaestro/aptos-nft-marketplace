export type NFT = {
  id: string;
  creator: string;
  collection: string;
  name: string;
  description: string;
  uri: string;
  price: number;
  for_sale: boolean;
};

export const mockNFTs: NFT[] = [
  {
    id: "1",
    creator: "0x1234...5678",
    collection: "Cosmic Creatures",
    name: "Cosmic Kitty",
    description: "A cute cat floating in space",
    uri: "https://fastly.picsum.photos/id/186/200/200.jpg?hmac=bNtKzMZT8HFzZq8mbTSWaQvmkX8T7TE47fspKMfxVl8",
    price: 0.5,
    for_sale: true,
  },
  {
    id: "2",
    creator: "0xabcd...efgh",
    collection: "Digital Pets",
    name: "Digital Doggo",
    description: "A playful dog made of binary code",
    uri: "https://fastly.picsum.photos/id/186/200/200.jpg?hmac=bNtKzMZT8HFzZq8mbTSWaQvmkX8T7TE47fspKMfxVl8",
    price: 0.75,
    for_sale: true,
  },
  {
    id: "3",
    creator: "0x9876...5432",
    collection: "Pixel Paradise",
    name: "Pixel Parrot",
    description: "A colorful parrot in pixel art style",
    uri: "https://fastly.picsum.photos/id/186/200/200.jpg?hmac=bNtKzMZT8HFzZq8mbTSWaQvmkX8T7TE47fspKMfxVl8",
    price: 0.3,
    for_sale: false,
  },
  {
    id: "4",
    creator: "0x1234...5678",
    collection: "Cosmic Creatures",
    name: "Cosmic Kitty",
    description: "A cute cat floating in space",
    uri: "https://fastly.picsum.photos/id/186/200/200.jpg?hmac=bNtKzMZT8HFzZq8mbTSWaQvmkX8T7TE47fspKMfxVl8",
    price: 0.5,
    for_sale: true,
  },
  {
    id: "5",
    creator: "0xabcd...efgh",
    collection: "Digital Pets",
    name: "Digital Doggo",
    description: "A playful dog made of binary code",
    uri: "https://fastly.picsum.photos/id/186/200/200.jpg?hmac=bNtKzMZT8HFzZq8mbTSWaQvmkX8T7TE47fspKMfxVl8",
    price: 0.75,
    for_sale: true,
  },
  {
    id: "6",
    creator: "0x9876...5432",
    collection: "Pixel Paradise",
    name: "Pixel Parrot",
    description: "A colorful parrot in pixel art style",
    uri: "https://fastly.picsum.photos/id/186/200/200.jpg?hmac=bNtKzMZT8HFzZq8mbTSWaQvmkX8T7TE47fspKMfxVl8",
    price: 0.3,
    for_sale: false,
  },
  {
    id: "7",
    creator: "0x1234...5678",
    collection: "Cosmic Creatures",
    name: "Cosmic Kitty",
    description: "A cute cat floating in space",
    uri: "https://fastly.picsum.photos/id/186/200/200.jpg?hmac=bNtKzMZT8HFzZq8mbTSWaQvmkX8T7TE47fspKMfxVl8",
    price: 0.5,
    for_sale: true,
  },
  {
    id: "8",
    creator: "0xabcd...efgh",
    collection: "Digital Pets",
    name: "Digital Doggo",
    description: "A playful dog made of binary code",
    uri: "https://fastly.picsum.photos/id/186/200/200.jpg?hmac=bNtKzMZT8HFzZq8mbTSWaQvmkX8T7TE47fspKMfxVl8",
    price: 0.75,
    for_sale: true,
  },
  {
    id: "9",
    creator: "0x9876...5432",
    collection: "Pixel Paradise",
    name: "Pixel Parrot",
    description: "A colorful parrot in pixel art style",
    uri: "https://fastly.picsum.photos/id/186/200/200.jpg?hmac=bNtKzMZT8HFzZq8mbTSWaQvmkX8T7TE47fspKMfxVl8",
    price: 0.3,
    for_sale: false,
  },
];

export const truncateAddress = (address: string, start = 6, end = 4) => {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};
