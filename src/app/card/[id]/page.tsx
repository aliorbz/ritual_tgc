"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Share2, 
  Info, 
  History, 
  Tag, 
  ShoppingCart, 
  Hand, 
  User, 
  Clock,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { getRoleColors } from "@/lib/utils";

export default function CardDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("info");

  // Mock data for the specific card
  const card = {
    id: id,
    name: `Ritual Card #${id}`,
    role: id === "1" ? "Mod" : id === "5" ? "Radiant" : "Ritualist",
    price: id === "1" ? "250" : id === "5" ? "150" : "45",
    owner: "0x8888...9999",
    creator: "0x8888...9999",
    mintDate: "May 15, 2026",
    description: "A unique collectible card from the Ritual TCG ecosystem. This card represents your verified role and contribution to the network.",
    image: `https://placehold.co/800x1200/1a1a1a/ffffff?text=CARD+${id}`,
    attributes: [
      { trait_type: "Tier", value: id === "1" ? "Mod" : id === "5" ? "Radiant" : "Ritualist" },
      { trait_type: "Level", value: "Level 1" },
      { trait_type: "Network", value: "Ritual Foundation" },
    ],
    history: [
      { event: "Minted", from: "0x0000...0000", to: "0x8888...9999", date: "2 days ago", price: "-" },
      { event: "Listed", from: "0x8888...9999", to: "-", date: "1 day ago", price: "45 RITUAL" },
    ]
  };

  const colors = getRoleColors(card.role);

  return (
    <div className="container mx-auto px-6 py-12">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8">
        <ChevronLeft size={20} /> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Large Image */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="sticky top-24"
          >
            <div className={`relative aspect-[2/3] rounded-[40px] overflow-hidden border ${colors.border} shadow-2xl group glossy`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={card.image} 
                alt={card.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-3">
                  <div 
                    className="px-6 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: colors.primary }}
                  >
                    {card.role} Tier
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-8">
              <button className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white">
                <Share2 size={20} />
              </button>
              <button className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white">
                <RefreshCcwIcon size={20} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right: Info & Actions */}
        <div className="lg:col-span-7 space-y-10">
          <header>
            <div 
              className="flex items-center gap-2 mb-3 font-bold text-sm tracking-[0.3em] uppercase"
              style={{ color: colors.primary }}
            >
              <ShieldCheck size={16} /> Verified Ritual Collection
            </div>
            <h1 className="text-5xl lg:text-7xl font-outfit font-black mb-6 tracking-tight">{card.name}</h1>
            <div className="flex flex-wrap items-center gap-8 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-white/40 font-medium">Owned by</span>
                <span className="font-mono font-bold px-3 py-1 rounded-lg bg-white/5" style={{ color: colors.primary }}>{card.owner}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/40 font-medium">Created by</span>
                <span className="font-mono font-bold px-3 py-1 rounded-lg bg-white/5">{card.creator}</span>
              </div>
            </div>
          </header>

          <div className="p-10 rounded-[32px] bg-white/5 border border-white/10 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Current Price</p>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-outfit font-black leading-none">{card.price}</span>
                    <span className="text-2xl font-bold mb-1" style={{ color: colors.primary }}>RITUAL</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4 flex items-center justify-end gap-2">
                    <Clock size={16} /> Ends in
                  </p>
                  <p className="text-xl font-outfit font-bold">2d 14h 22m</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <motion.button 
                  whileHover={{ backgroundColor: colors.primary, borderColor: colors.primary }}
                  className="py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={22} /> Buy Now
                </motion.button>
                <button className="py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3">
                  <Hand size={22} /> Make Offer
                </button>
              </div>
            </div>
            {/* Background Glow */}
            <div 
              className="absolute -top-24 -right-24 w-64 h-64 blur-[100px] rounded-full opacity-20"
              style={{ backgroundColor: colors.primary }}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-8 border-b border-white/5 pb-6">
              <button 
                onClick={() => setActiveTab("info")}
                className={`flex items-center gap-2 font-bold transition-all relative py-2 ${activeTab === "info" ? "text-white" : "text-white/40"}`}
              >
                <Info size={20} /> Information
                {activeTab === "info" && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 rounded-full" style={{ backgroundColor: colors.primary }} />
                )}
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 font-bold transition-all relative py-2 ${activeTab === "history" ? "text-white" : "text-white/40"}`}
              >
                <History size={20} /> History
                {activeTab === "history" && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 rounded-full" style={{ backgroundColor: colors.primary }} />
                )}
              </button>
            </div>

            <div className="py-2">
              {activeTab === "info" ? (
                <div className="space-y-8">
                  <p className="text-lg text-white/60 leading-relaxed max-w-2xl">{card.description}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {card.attributes.map((attr, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center group hover:border-white/20 transition-all">
                        <p className="text-[10px] uppercase font-bold text-white/30 mb-2 tracking-widest">{attr.trait_type}</p>
                        <p className="font-bold text-base" style={{ color: i === 0 ? colors.primary : undefined }}>{attr.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/10 text-white/30 font-bold uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="px-8 py-5">Event</th>
                        <th className="px-8 py-5">Price</th>
                        <th className="px-8 py-5">From</th>
                        <th className="px-8 py-5">To</th>
                        <th className="px-8 py-5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {card.history.map((item, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-all group">
                          <td className="px-8 py-5 font-bold flex items-center gap-3">
                            <Tag size={16} style={{ color: colors.primary }} /> {item.event}
                          </td>
                          <td className="px-8 py-5 font-mono">{item.price}</td>
                          <td className="px-8 py-5 font-mono" style={{ color: colors.primary }}>{item.from}</td>
                          <td className="px-8 py-5 font-mono" style={{ color: colors.primary }}>{item.to}</td>
                          <td className="px-8 py-5 text-white/40">{item.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshCcwIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}
