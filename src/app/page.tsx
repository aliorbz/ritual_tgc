"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Filter, SlidersHorizontal, ArrowUpDown, Zap, Shield, Trophy, ChevronRight } from "lucide-react";
import { NFTCard } from "@/components/NFTCard";
import { getRoleColors } from "@/lib/utils";

const MOCK_CARDS = [
  { id: "1", name: "RitualMaster#001", role: "Mod", price: "250", image: "https://placehold.co/400x600/1a1a1a/ffffff?text=MOD+CARD", seller: "0x1234...5678" },
  { id: "2", name: "ShadowWalker#999", role: "Ritualist", price: "45", image: "https://placehold.co/400x600/1a1a1a/ffffff?text=RITUALIST+CARD", seller: "0x8888...9999" },
  { id: "3", name: "LightningBolt#777", role: "Ritty", price: "12", image: "https://placehold.co/400x600/1a1a1a/ffffff?text=RITTY+CARD", seller: "0xaaaa...bbbb" },
  { id: "4", name: "VoidSeeker#444", role: "Bitty", price: "5", image: "https://placehold.co/400x600/1a1a1a/ffffff?text=BITTY+CARD", seller: "0xcccc...dddd" },
  { id: "5", name: "RadiantKing#1337", role: "Radiant", price: "150", image: "https://placehold.co/400x600/1a1a1a/ffffff?text=RADIANT+CARD", seller: "0xeeee...ffff" },
  { id: "6", name: "DevMaster#000", role: "Mod", price: "300", image: "https://placehold.co/400x600/1a1a1a/ffffff?text=MOD+CARD+2", seller: "0x2222...3333" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const roles = ["All", "Mod", "Radiant", "Ritualist", "Ritty", "Bitty"];

  const filteredCards = MOCK_CARDS.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase()) || card.id === search;
    const matchesFilter = filter === "All" || card.role === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold tracking-widest mb-6 inline-block uppercase">
              Ritual Foundation Testnet
            </span>
            <h1 className="text-4xl lg:text-7xl font-outfit font-black mb-6 leading-[1.1] tracking-tight">
              Collect Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400">
                Ritual Legacy
              </span>
            </h1>
            <p className="text-white/50 text-base lg:text-lg max-w-xl mb-8 leading-relaxed font-medium">
              The first Discord-native TCG marketplace. Mint unique trading cards based on your Ritual community roles.
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/30 blur-[120px] rounded-full" />
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="container mx-auto px-6 pb-24">
        <div className="flex flex-col gap-8">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              <div className="relative w-full sm:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full sm:w-auto">
                {roles.map(role => {
                  const colors = getRoleColors(role);
                  const isActive = filter === role;
                  
                  return (
                    <button
                      key={role}
                      onClick={() => setFilter(role)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                        isActive 
                        ? "text-white shadow-lg" 
                        : "bg-white/5 text-white/40 border-transparent hover:bg-white/10"
                      }`}
                      style={{ 
                        backgroundColor: isActive ? colors.primary : undefined,
                        borderColor: isActive ? colors.primary : undefined,
                        boxShadow: isActive ? `0 10px 20px -5px ${colors.primary}44` : undefined
                      }}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 self-end lg:self-auto">
              <button className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/60">
                <SlidersHorizontal size={20} />
              </button>
              <button className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/60 flex items-center gap-2 px-4 text-sm font-bold">
                <ArrowUpDown size={18} /> Sort
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
            {filteredCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <NFTCard {...card} />
              </motion.div>
            ))}
          </div>

          {filteredCards.length === 0 && (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                <Search size={32} className="text-white/20" />
              </div>
              <h3 className="text-2xl font-outfit font-black mb-2 tracking-tight">No cards found</h3>
              <p className="text-white/40 font-medium">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Compact */}
      <section className="w-full py-24 bg-white/[0.02] border-y border-white/5 mt-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Zap className="text-yellow-400" size={24} />,
                title: "Role-Based Power",
                description: "Your card type is determined by your Ritual Discord status."
              },
              {
                icon: <Shield className="text-blue-400" size={24} />,
                title: "Secure Trading",
                description: "Secured by Ritual testnet smart contracts."
              },
              {
                icon: <Trophy className="text-purple-400" size={24} />,
                title: "Rare Collections",
                description: "Collect all 5 role tiers including the elusive Radiant Ritualist."
              }
            ].map((feature, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-outfit font-bold mb-2 tracking-tight">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
