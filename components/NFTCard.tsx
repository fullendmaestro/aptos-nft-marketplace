import { NFT, truncateAddress } from "@/lib/mockData";

interface NFTCardProps {
  nft: NFT;
  onActionClick: (nft: NFT) => void;
  actionLabel: string;
}

export default function NFTCard({
  nft,
  onActionClick,
  actionLabel,
}: NFTCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={nft.uri} alt={nft.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="mt-2 text-xl font-semibold">{nft.name}</h3>
        <p className="mt-1 text-gray-600">{nft.description}</p>
        <p className="mt-2">Price: {nft.price} APT</p>
        <p className="mt-1 text-sm text-gray-500">
          Collection: {nft.collection}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Creator: {truncateAddress(nft.creator)}
        </p>
        <button
          onClick={() => onActionClick(nft)}
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
