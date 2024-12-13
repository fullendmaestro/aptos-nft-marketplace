import NavBar from "@/components/NavBar";
import MyNFTs from "@/components/MyNFTs";

export default function MyNFTsPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <MyNFTs />
      </div>
    </main>
  );
}
