"use client";

import React from "react";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { useSession, signIn } from "next-auth/react";
import { User, Wallet, Grid, PlusCircle, Settings, ExternalLink, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RITUAL_NETWORK, ROLE_COLORS } from "@/lib/config";
import { Navbar } from "@/components/Navbar";
import { CardPreview } from "@/components/CardPreview";

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
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                <h1 className="text-4xl font-black tracking-tight uppercase">
                  {session?.user?.name || "Ritual Explorer"}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-mono text-white/60 tracking-wider">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-wider">
                    {isBalanceLoading ? "..." : `${readableBalance} RITUAL`}
                  </div>
                </div>
              </div>
              
              {/* Role Badge */}
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div 
                  className="px-3 py-1 rounded-lg border"
                  style={{ 
                    backgroundColor: "rgba(255, 215, 0, 0.1)", 
                    borderColor: "rgba(255, 215, 0, 0.3)" 
                  }}
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                    Radiant Ritualist
                  </span>
                </div>
                {session && <ShieldCheck className="text-blue-500" size={18} />}
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
            <motion.div 
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-10"
            >
              <div className="text-center mb-16 max-w-xl">
                <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Create Your Ritual</h2>
                <p className="text-white/40 leading-relaxed font-medium">This is a preview of your unique TCG card. It is generated using your Discord identity and Ritual server status.</p>
              </div>

              {!session ? (
                <div className="p-12 rounded-[40px] bg-white/5 border border-white/10 text-center relative overflow-hidden group w-full max-w-lg">
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-[#5865F2]/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                      <User className="text-[#5865F2]" size={36} />
                    </div>
                    <h2 className="text-2xl font-black mb-4">Connect Discord</h2>
                    <p className="text-white/40 mb-10 leading-relaxed">Please connect your Discord account to see your personalized card preview.</p>
                    <button 
                      onClick={() => signIn("discord")}
                      className="px-10 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 mx-auto"
                    >
                      Connect Discord
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-16 items-center w-full max-w-5xl">
                  <div className="flex-1 space-y-10 order-2 lg:order-1">
                    <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 space-y-8">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-4">Identity Details</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-sm text-white/60">Username</span>
                            <span className="text-sm font-bold text-white">{session.user?.name}</span>
                          </div>
                          <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-sm text-white/60">Discord Role</span>
                            <span className="text-sm font-bold text-yellow-400">Radiant Ritualist</span>
                          </div>
                          <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-sm text-white/60">Blockchain Address</span>
                            <span className="text-sm font-mono text-purple-400">{address?.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button 
                          className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-[24px] font-black text-lg uppercase tracking-tighter shadow-2xl shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                          Mint Your TCG Card
                        </button>
                        <p className="text-center text-[10px] text-white/20 mt-4 font-bold uppercase tracking-widest">Only one mint allowed per account</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 order-1 lg:order-2 flex justify-center">
                    <CardPreview 
                      username={session.user?.name || "Ritualist"}
                      avatar={session.user?.image || ""}
                      role={{ type: "radiant", name: "Radiant Ritualist" }}
                      walletAddress={address}
                      stats={{ messages: "1.2k", joins: "Mar 2024", activity: "High" }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
