"use client";

import React from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import { formatEther } from "viem";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RITUAL_NETWORK } from "@/lib/config";

export function Navbar() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: address,
    chainId: RITUAL_NETWORK.id,
  });

  const readableBalance = balanceData 
    ? parseFloat(formatEther(balanceData.value)).toFixed(4) 
    : "0.0000";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shadow-emerald-500/10 overflow-hidden"
          >
            <img src="/ritual.jpg" alt="Ritual Logo" className="w-full h-full object-cover" />
          </motion.div>
          <span className="font-outfit font-black text-2xl tracking-tighter hidden sm:block uppercase">
            Ritual <span className="text-emerald-500">TCG</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl mr-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold font-mono text-white/80">
                {isBalanceLoading ? "..." : `${readableBalance} RITUAL`}
              </span>
            </div>
          )}
          <ConnectButton showBalance={false} chainStatus="none" accountStatus="address" />
          
          {isConnected && (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group overflow-hidden"
              >
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-white/60 group-hover:text-white" />
                )}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setIsDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 p-2 font-sans"
                    >
                      {session?.user?.name && (
                        <div className="px-4 py-3 border-b border-white/5 mb-1.5 flex items-center gap-3">
                          {session?.user?.image ? (
                            <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                              <User size={14} className="text-white/40" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="text-xs font-black truncate text-white uppercase tracking-tight leading-none">{session.user.name}</p>
                            <p className="text-[9px] font-bold text-emerald-400 tracking-widest uppercase mt-1">Discord synced</p>
                          </div>
                        </div>
                      )}

                      <Link 
                        href="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <span className="flex items-center gap-3"><User size={16} /> Profile Hub</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Mint</span>
                      </Link>

                      <button 
                        onClick={() => {
                          disconnect();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-red-400/60 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all mt-1"
                      >
                        <LogOut size={16} /> Disconnect
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
