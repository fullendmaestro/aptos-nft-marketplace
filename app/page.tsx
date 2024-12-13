import NavBar from "@/components/NavBar";
import MarketView from "@/components/MarketView";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <MarketView />
      </div>
    </main>
  );
}
