"use client";

import React from "react";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { useSession, signIn } from "next-auth/react";
import { User, Wallet, Grid, PlusCircle, Settings, ExternalLink, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RITUAL_NETWORK } from "@/lib/config";
import { Navbar } from "@/components/Navbar";

export default function ProfilePage() {
  const { isConnected, address } = useAccount();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = React.useState("cards");

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: address,
    chainId: RITUAL_NETWORK.id,
  });

  const readableBalance = balanceData 
    ? parseFloat(formatEther(balanceData.value)).toFixed(4) 
    : "0.0000";

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <Navbar />
        <div className="container mx-auto px-6 py-40 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
            <Wallet className="text-white/20" size={32} />
          </div>
          <h1 className="text-4xl font-black mb-4">Connect Wallet</h1>
          <p className="text-white/40 max-w-sm mb-10">Connect your wallet to view your Ritual TCG profile and manage your cards.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pb-20">
      <Navbar />
      
      {/* Cover Area */}
      <div className="h-64 w-full bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-black relative border-b border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      <div className="container mx-auto px-6">
        <div className="relative -mt-20 flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-white/5">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Profile Picture */}
            <div className="w-40 h-40 rounded-[40px] bg-[#0a0a0a] border-4 border-[#050505] shadow-2xl overflow-hidden relative group">
              {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                  <User size={64} className="text-white/10" />
                </div>
              )}
            </div>

            <div className="text-center md:text-left mb-2">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tight uppercase">
                  {session?.user?.name || "Ritual Explorer"}
                </h1>
                {session && <ShieldCheck className="text-blue-500" size={24} />}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-mono text-white/60">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400">
                  {isBalanceLoading ? "..." : `${readableBalance} RITUAL`}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!session && (
              <button 
                onClick={() => signIn("discord")}
                className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-black transition-all text-sm flex items-center gap-2"
              >
                Connect Discord
              </button>
            )}
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <Settings size={20} className="text-white/60" />
            </button>
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <ExternalLink size={20} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 py-8 border-b border-white/5 mb-12 overflow-x-auto scrollbar-hide">
          {[
            { id: "cards", label: "Collected", icon: <Grid size={18} /> },
            { id: "create", label: "Create", icon: <PlusCircle size={18} /> },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all relative pb-8 -mb-[33px] ${
                activeTab === tab.id ? "text-white" : "text-white/30 hover:text-white"
              }`}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === "cards" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <div className="aspect-[3/4] rounded-[32px] border-2 border-dashed border-white/5 bg-white/[0.02] flex flex-col items-center justify-center p-8 text-center group hover:border-white/20 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <PlusCircle className="text-white/20" size={32} />
                </div>
                <h4 className="font-bold mb-2">No Cards Yet</h4>
                <p className="text-xs text-white/30">Connect Discord to generate your first Ritual TCG card.</p>
              </div>
            </div>
          )}

          {activeTab === "create" && (
            <div className="max-w-2xl mx-auto py-20 text-center">
              <h2 className="text-3xl font-black mb-4">Create Your Card</h2>
              <p className="text-white/40 mb-10">Verify your Discord identity to mint your unique role-based trading card on the Ritual blockchain.</p>
              {!session ? (
                <button 
                  onClick={() => signIn("discord")}
                  className="px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20"
                >
                  Connect Discord to Begin
                </button>
              ) : (
                <p className="text-purple-400 font-bold italic">Discord Connected! Preparing your ritual...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
