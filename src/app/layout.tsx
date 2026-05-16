import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import { DiscordProvider } from "@/components/DiscordProvider";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Ritual TCG Cards | Web3 NFT Marketplace",
  description: "Mint and trade unique TCG cards based on your Ritual Discord roles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-[#050505] text-white min-h-screen selection:bg-purple-500/30`}>
        <DiscordProvider>
          <Web3Provider>
            <div className="relative flex flex-col min-h-screen overflow-x-hidden">
              {/* Background Glows */}
              <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
              </div>
              
              <Navbar />
              <main className="flex-grow pt-20">
                {children}
              </main>
              
              <footer className="border-t border-white/5 py-10 bg-black/40 backdrop-blur-md">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">R</div>
                    <span className="font-outfit font-bold text-xl">Ritual TCG</span>
                  </div>
                  <p className="text-white/40 text-sm">© 2026 Ritual TCG Cards. Built for Ritual Testnet.</p>
                </div>
              </footer>
            </div>
          </Web3Provider>
        </DiscordProvider>
      </body>
    </html>
  );
}
