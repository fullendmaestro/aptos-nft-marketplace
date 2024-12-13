import { NFT } from "@/lib/mockData";
import NFTCard from "./NFTCard";

interface NFTGridProps {
  nfts: NFT[];
  onActionClick: (nft: NFT) => void;
  actionLabel: string;
}

export default function NFTGrid({
  nfts,
  onActionClick,
  actionLabel,
}: NFTGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <NFTCard
          key={nft.id}
          nft={nft}
          onActionClick={onActionClick}
          actionLabel={actionLabel}
        />
      ))}
    </div>
  );
}
