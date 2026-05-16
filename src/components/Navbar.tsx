"use client";

import React from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-11 h-11 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shadow-purple-500/20"
          >
            R
          </motion.div>
          <span className="font-outfit font-black text-2xl tracking-tighter hidden sm:block uppercase">
            Ritual <span className="text-purple-500">TCG</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ConnectButton showBalance={true} chainStatus="none" accountStatus="address" />
          
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
                      className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 p-2"
                    >
                      <div className="px-4 py-3 border-b border-white/5 mb-2">
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Account</p>
                        <p className="text-xs font-mono text-purple-400 truncate">{address}</p>
                      </div>

                      <Link 
                        href="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <User size={18} /> Profile
                      </Link>

                      <button 
                        onClick={() => {
                          disconnect();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400/60 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
                      >
                        <LogOut size={18} /> Disconnect
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
