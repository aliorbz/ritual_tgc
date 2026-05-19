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
import { usePathname } from "next/navigation";

export function Navbar() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const pathname = usePathname();

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: address,
    chainId: RITUAL_NETWORK.id,
  });

  const readableBalance = balanceData 
    ? parseFloat(formatEther(balanceData.value)).toFixed(4) 
    : "0.0000";

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      {/* Dynamic Fading Glass-Blur Background */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-[6px]"
        style={{
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)"
        }}
      />
      <div className="container mx-auto px-3 sm:px-6 h-20 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-9 h-9 sm:w-12 sm:h-12 bg-black rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shadow-emerald-500/10 overflow-hidden"
          >
            <img src="/ritual.jpg" alt="Ritual Logo" className="w-full h-full object-cover" />
          </motion.div>
          <span className="font-outfit font-black text-2xl tracking-tighter hidden sm:block uppercase">
            Ritual <span className="text-emerald-500">TCG</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <div className="flex items-center gap-1 bg-white/[0.02] border border-white/5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-md">
          {[
            { label: "Home", href: "/" },
            { label: "Market", href: "/marketplace" },
            { label: "Mint", href: "/profile?tab=create" },
          ].map((item) => {
            const isActive = pathname === item.href.split("?")[0];
            return (
              <Link 
                key={item.label}
                href={item.href}
                className="relative text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full select-none"
              >
                <span className={`relative z-10 transition-colors duration-300 ${isActive ? "text-white" : "text-white/40 hover:text-white"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="navTabLine" 
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl mr-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold font-mono text-white/80">
                {isBalanceLoading ? "..." : `${readableBalance} RITUAL`}
              </span>
            </div>
          )}
          {/* Desktop/Tablet: Default RainbowKit Connect Button */}
          <div className="hidden md:block">
            <ConnectButton showBalance={false} chainStatus="none" accountStatus="address" />
          </div>

          {/* Mobile only: Custom Compact Connect Button */}
          <div className="md:hidden">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      className: "opacity-0 pointer-events-none select-none",
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            type="button"
                            className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-white text-black hover:bg-white/90 rounded-xl transition-all shadow-md active:scale-95 flex-shrink-0"
                          >
                            Connect
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openAccountModal}
                            type="button"
                            className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl transition-all flex-shrink-0"
                          >
                            Wrong Network
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="px-2.5 py-1.5 text-[10px] font-black font-mono tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 text-white/90 rounded-xl transition-all flex-shrink-0"
                        >
                          {account.displayName}
                        </button>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
          
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

                      {/* Mobile Wallet & Balance Section */}
                      {isConnected && (
                        <div className="md:hidden px-4 py-3 border-b border-white/5 mb-1.5 bg-white/[0.02] rounded-xl">
                          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Wallet Connection</p>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-white/60 tracking-wider">
                              {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                            <span className="text-[10px] font-black font-mono text-emerald-400">
                              {isBalanceLoading ? "..." : `${readableBalance} RITUAL`}
                            </span>
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
