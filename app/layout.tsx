import "./globals.css";
import { Inter } from "next/font/google";
import { StoreProvider } from "./StoreProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NFT Marketplace",
  description: "An NFT marketplace built with Next.js and Aptos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>{children}</StoreProvider>{" "}
      </body>
    </html>
  );
}
