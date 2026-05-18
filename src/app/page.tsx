"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Zap, 
  Shield, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Flame, 
  Loader2 
} from "lucide-react";
import { parseEther, formatEther, createPublicClient, http } from "viem";
import { CONTRACTS, RITUAL_NETWORK } from "@/lib/config";
import { Navbar } from "@/components/Navbar";
import { CardPreview } from "@/components/CardPreview";

// ─── Dynamic RPC Chain definition ───────────────────────────────────
const RITUAL_CHAIN = {
  id: RITUAL_NETWORK.id,
  name: RITUAL_NETWORK.name,
  nativeCurrency: RITUAL_NETWORK.nativeCurrency,
  rpcUrls: { 
    default: { 
      http: [process.env.NODE_ENV === "development" ? "http://127.0.0.1:8545" : "https://rpc.ritualfoundation.org"] 
    } 
  },
} as const;

function getClient() {
  return createPublicClient({ chain: RITUAL_CHAIN as any, transport: http() });
}

type CardMeta = { 
  discordId: string; 
  discordRole: string; 
  discordUsername: string;
  image?: string;
  traits?: any;
};

type Listing = {
  tokenId: bigint;
  cardMeta?: CardMeta;
  price: bigint;
};

export default function Home() {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeatured = useCallback(async () => {
    setIsLoading(true);
    try {
      const client = getClient();

      // Step 1: Get total minted count
      const totalSupply = await client.readContract({
        address: CONTRACTS.NFT.address,
        abi: CONTRACTS.NFT.abi,
        functionName: "totalSupply",
        args: [],
      }) as bigint;

      const total = Number(totalSupply);
      if (total === 0) { setFeaturedListings([]); setIsLoading(false); return; }

      const list: Listing[] = [];

      // Step 2: Scan each NFT token and check if it's actively listed
      for (let i = 1; i <= total && list.length < 4; i++) {
        try {
          const tokenId = BigInt(i);

          // Check activeListings per card
          const listing = await client.readContract({
            address: CONTRACTS.MARKETPLACE.address,
            abi: CONTRACTS.MARKETPLACE.abi,
            functionName: "activeListings",
            args: [CONTRACTS.NFT.address, tokenId],
          }) as any;

          const isActive = Array.isArray(listing) ? listing[5] : listing?.active;
          const price = Array.isArray(listing) ? listing[4] : listing?.price;

          if (!isActive || !price || price === BigInt(0)) continue;

          // Fetch metadata
          let cardMeta: CardMeta | undefined;
          try {
            const res = await fetch(`/api/metadata/${tokenId}?t=${Date.now()}`);
            if (res.ok) {
              const meta = await res.json();
              cardMeta = {
                discordId: meta.discordId,
                discordRole: meta.discordRole,
                discordUsername: meta.name,
                image: meta.image,
                traits: meta.traits
              };
            }
          } catch (_) {
            try {
              const meta = await client.readContract({
                address: CONTRACTS.NFT.address,
                abi: CONTRACTS.NFT.abi,
                functionName: "cardData",
                args: [tokenId],
              }) as any;
              cardMeta = {
                discordId: Array.isArray(meta) ? meta[0] : meta.discordId,
                discordRole: Array.isArray(meta) ? meta[1] : meta.discordRole,
                discordUsername: Array.isArray(meta) ? meta[2] : meta.discordUsername,
              };
            } catch (_) {}
          }

          list.push({ tokenId, price, cardMeta });
        } catch (_) {
          continue;
        }
      }

      setFeaturedListings(list);
    } catch (e) {
      console.error("Failed to load featured listings", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return (
    <div className="flex flex-col min-h-screen bg-[#060606] text-white overflow-hidden font-['Outfit',sans-serif] relative">
      <Navbar />

      {/* Infinite Video Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          className="w-full h-full object-cover opacity-15 filter blur-[8px]"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/media/ritualvid.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay with gradients to integrate the video smoothly */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060606]/30 via-[#060606]/70 to-[#060606]" />
      </div>

      {/* Hero Section */}
      <section className="relative w-full py-28 lg:py-40 flex items-center justify-center z-10">
        {/* Background Glowing Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-600/10 blur-[150px] rounded-full pointer-events-none z-0" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-widest mb-6 inline-block uppercase font-sans">
              <Sparkles size={10} className="inline mr-1.5 align-middle" /> Web3 Discord Trading Card Collection
            </span>
            
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tighter uppercase">
              Collect Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-purple-400 to-purple-500 drop-shadow-[0_2px_20px_rgba(16,185,129,0.3)]">
                Ritual TCG
              </span>
            </h1>
            
            <p className="text-white/50 text-base md:text-xl max-w-xl mb-10 leading-relaxed font-sans font-medium">
              The first Discord-native TCG collection on Ritual Testnet
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 w-full justify-center">
              <Link 
                href="/marketplace"
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-white text-black font-black text-lg flex items-center justify-center gap-3 transition-all hover:brightness-95 shadow-xl hover:shadow-white/5"
              >
                Enter Marketplace <ArrowRight size={20} />
              </Link>
              <Link 
                href="/profile"
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-lg flex items-center justify-center gap-3 transition-all"
              >
                Connect &amp; Mint Card
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="container mx-auto px-6 py-20 border-t border-white/5 relative z-10 bg-white/[0.01]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {[
            {
              icon: <Layers className="text-emerald-400" size={26} />,
              title: "Discord-Native Traits",
              description: "Your card type and attributes are direct mirrors of your Ritual Discord server role, message activity, and days in server."
            },
            {
              icon: <Shield className="text-blue-400" size={26} />,
              title: "Transparent 5% Royalty",
              description: "Secured by robust smart contracts. Only a small 5% platform royalty is taken on successful marketplace sales, maximizing profit for creators."
            },
            {
              icon: <Flame className="text-yellow-400" size={26} />,
              title: "Upgradable Power Tiers",
              description: "Minted a card as a Bitty? Unlock next-tier minting capabilities automatically as you climb roles to Ritty, Ritualist, or Mod!"
            }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 flex flex-col gap-5 hover:border-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{feat.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-sans">{feat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Showcase Section (Featured Cards) */}
      <section className="container mx-auto px-6 py-24 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Live Featured Cards</h2>
              <p className="text-white/40 text-sm mt-1 font-sans">Freshly minted assets available for purchase or bidding right now.</p>
            </div>
            <Link 
              href="/marketplace" 
              className="flex items-center gap-2 text-white/50 hover:text-white font-bold text-sm tracking-wider uppercase transition-all font-sans"
            >
              See All <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
              <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] font-sans">Scanning Testnet Catalog...</p>
            </div>
          ) : featuredListings.length === 0 ? (
            <div className="py-20 text-center rounded-[32px] border-2 border-dashed border-white/5 bg-[#0a0a0a]/50">
              <Trophy size={48} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/30 font-bold text-sm">No Live Listings Available</p>
              <p className="text-white/20 text-xs mt-1 font-sans">Be the first to mint and list your TCG card in the marketplace!</p>
              <Link 
                href="/profile" 
                className="mt-5 inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 transition-all font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 font-sans"
              >
                Mint My Card Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredListings.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative group rounded-[32px] bg-[#0a0a0a]/80 border border-white/5 hover:border-white/15 p-4 flex flex-col items-center"
                >
                  <Link href={`/card/${item.tokenId}`} className="block w-full">
                    <div className="flex justify-center transition-transform duration-500 group-hover:scale-[1.02]">
                      <CardPreview
                        tokenId={item.tokenId.toString()}
                        role={{ 
                          type: item.cardMeta?.discordRole || "ritualist", 
                          name: item.cardMeta?.discordRole || "Ritualist" 
                        }}
                        username={item.cardMeta?.discordUsername || "Ritualist"}
                        avatar={item.cardMeta?.image || ""}
                        stats={item.cardMeta?.traits || { messages: "0", level: "1", activity: "New" }}
                      />
                    </div>
                  </Link>
                  <div className="w-full mt-4 p-2 flex items-center justify-between border-t border-white/5 pt-4">
                    <div>
                      <p className="text-[9px] text-white/30 uppercase font-black font-sans">Listed For</p>
                      <p className="text-sm font-black mt-0.5">{formatEther(item.price)} RITUAL</p>
                    </div>
                  <Link 
                      href={`/card/${item.tokenId}`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-all font-black text-xs uppercase tracking-wider text-center font-sans shadow-md shadow-emerald-500/10"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 bg-black/80 border-t border-white/5 mt-auto relative z-10">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-white/30 text-xs font-sans font-bold uppercase tracking-widest">
          <p>© 2026 Ritual TCG ecosystem</p>
          <div className="flex items-center gap-6">
            <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
            <Link href="/profile" className="hover:text-white transition-colors">Profile Hub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
