# Aptos NFT Marketplace

![My NFTs Page](https://github.com/fullendmaestro/aptos-nft-marketplace/blob/main/public/my-nfts-page.jpg)
[## Aptos NFT Marketplace](https://aptos-nft-marketplace-pi.vercel.app/)

Welcome to the Aptos NFT Marketplace project! This innovative decentralized application (dApp) is built on the Aptos blockchain, offering a comprehensive platform for minting, buying, selling, and trading Non-Fungible Tokens (NFTs).
https://aptos-nft-marketplace-pi.vercel.app/

## Features

Our Aptos NFT Marketplace comes packed with cutting-edge features designed to provide a seamless and secure experience for NFT enthusiasts:

1. **NFT Minting**: Users can create and mint their own unique NFTs directly on the platform.

2. **Marketplace Listings**: Easily list your NFTs for sale at a fixed price.

3. **Direct Purchases**: Buy listed NFTs instantly at the seller's specified price.

4. **Auction System**: Participate in exciting NFT auctions! Place bids, track ongoing auctions, and win the NFT as the highest bidder.

5. **Offer System**: Make and receive offers on NFTs, allowing for more flexible trading options.

6. **NFT Transfers**: Transfer your NFTs to other wallets directly through the marketplace interface.

7. **Rarity Filtering**: Browse and filter NFTs based on their rarity levels.

8. **User Dashboard**: Keep track of your NFTs, active listings, ongoing auctions, and received offers all in one place.

## Functionality and Features

### Auction System

Our innovative auction system allows users to:

- Create auctions for their NFTs with customizable duration and starting price
- Place bids on active auctions
- Automatically transfer the NFT to the highest bidder when the auction ends
- Refund outbid participants

### NFT Transfers

The transfer functionality enables users to:

- Easily transfer their NFTs to any other Aptos wallet
- Gift NFTs to friends or move them between personal wallets
- Maintain a clear record of NFT provenance

### Offer System

Our comprehensive offer system allows:

- Making offers on any NFT in the marketplace provided its not in auction or listed for sale
- Setting expiration times for offers
- Accepting or declining received offers
- Automatic handling of funds transfer upon offer acceptance

## Code Quality

We pride ourselves on maintaining high code quality standards:

- **Clean Architecture**: The project follows a clean, modular architecture separating concerns between smart contracts, frontend components, and utility functions.
- **Type Safety**: Leveraging TypeScript for enhanced type safety and better developer experience.
- **Best Practices**: Adhering to React best practices for optimal performance and maintainability.
- **Error Handling**: Comprehensive error handling both in smart contracts and the frontend for a robust user experience.
- **Comments and Documentation**: Well-commented code for easier understanding and maintenance.

## Tech Stack

- **Blockchain**: Aptos
- **Smart Contract Language**: Move
- **Frontend**: React.js with vite
- **State Management**: Redux with Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: Ant Design

## Project Structure

```
aptos-nft-marketplace/
├── contracts/ # Smart contract files
│ └── sources/
│ └── NFTMarketplace.move # Main NFT marketplace contract
├── src/
│ ├── components/ # React components
│ │ ├── auction/ # Auction-related components
│ │ ├── common/ # Shared UI components
│ │ ├── nft/ # NFT-related components
│ │ ├── offer/ # Offer-related components
│ │ └── user/ # User-related components
│ ├── constants/ # Constant values and configurations
│ ├── hooks/ # Custom React hooks
│ ├── pages/ # React router page components
│ │ ├── MarketView.tsx # Main marketplace view
│ │ └── MyNFTs.tsx # User's NFT collection view
│ ├── store/ # Redux store setup
│ │ └── slices/ # Redux slices for state management
│ ├── types/ # TypeScript type definitions
│ └── utils/ # Utility functions
│ ├── aptosUtils.ts # Aptos blockchain interaction utilities
│ └── eventUtils.ts # Event handling utilities
├── styles/ # Global styles
├── package.json # Project dependencies and scripts
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json # TypeScript configuration
```

This structure provides an overview of the main directories and files in the project, along with brief descriptions of their purposes.

## Getting Started

To get started with the Aptos NFT Marketplace:

1. Clone the repository:

## Running locally

### Blockchain:

1. **Set Up a Petra Wallet**: Setup the Petra Aptos Wallet extension [here](https://chromewebstore.google.com/detail/petra-aptos-wallet/ejjladinnckdgjemekebdpeokbikhfci). Then switch to a prefered network, test net in this case. Request some faucet tokens in the wallet.

2. **Install the aptos cli**: Install the aptos cli [here](). Or run the following command directly. After installation run `aptos info` command to confirm the installation.

```sh
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

3. **Sectup `Move.toml`**: In the contract directory, setup the `NFTMarketplace` variable to your wallet address.

4. **Setup Marketplace Address**: Replace the address in the NFTMarketplace.move contract address with your wallet address.

5. **Compiling and Publishing**: In the contract directory run the following commands and enter the prompts as appropriatly.

```sh
aptos init
```

```sh
aptos move publish
```

```sh
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

6. **Inintialize the contract**: On the aptos explorer [page](), search for your wallet address and invoke the initialize function.

### Frontend:

The frontend Uses [Vite](https://vitejs.dev/), [Vitest](https://vitest.dev/), and [React Testing Library](https://github.com/testing-library/react-testing-library) to create a modern [React](https://react.dev/) app compatible with [Create React App](https://create-react-app.dev/)

At the root of the project, run the following commands:

```sh
pnpm install
```

```sh
pnpm run dev
```

## Scripts

- `dev`/`start` - start dev server and open browser
- `build` - build for production
- `preview` - locally preview production build
- `test` - launch test runner

## Video Demo Link (Youtube)

[Aptos NFTs Market Place - Stackup Aptos-IV Bounty](https://youtu.be/2zmf9SZcbJM)
https://youtu.be/2zmf9SZcbJM
