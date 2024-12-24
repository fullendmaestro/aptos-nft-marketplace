// src\pages\Home.tsx
const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to AptosNFT Marketplace
      </h1>
      <p className="text-xl mb-8">
        Discover, collect, and trade unique digital assets on the Aptos
        blockchain.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Explore NFTs</h2>
          <p>Browse through a wide variety of unique digital collectibles.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Create and Sell</h2>
          <p>Mint your own NFTs and list them for sale on our marketplace.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Participate in Auctions
          </h2>
          <p>Bid on exclusive NFTs in our exciting auction system.</p>
        </div>
      </div>
    </div>
  )
}

export default Home
