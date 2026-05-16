"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useAccount, useBalance } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  LogIn, 
  ExternalLink, 
  RefreshCcw, 
  Tag, 
  PlusCircle, 
  Grid, 
  History,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Wand2
} from "lucide-react";
import { NFTCard } from "@/components/NFTCard";
import { CardPreview } from "@/components/CardPreview";
import { getDiscordUserRoles, getMockUserRoles } from "@/lib/actions";
import { toPng } from "html-to-image";
import Link from "next/link";

import { useReadContract, useWriteContract } from "wagmi";
import { CONTRACTS } from "@/lib/config";

export default function Profile() {
  const { data: session, status: authStatus } = useSession();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [activeTab, setActiveTab] = useState("cards");

  // On-chain check for existing card
  const { data: hasAlreadyMinted } = useReadContract({
    address: CONTRACTS.NFT.address as `0x${string}`,
    abi: CONTRACTS.NFT.abi,
    functionName: "checkHasMinted",
    args: [session?.user?.id || ""],
    query: {
      enabled: !!session?.user?.id && isConnected,
    }
  });

  // Creation State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);

  const MOCK_OWNED = [
    { id: "2", name: "ShadowWalker#999", role: "Ritualist", price: "45", image: "https://placehold.co/400x600/1a1a1a/ffffff?text=RITUALIST+CARD", seller: address || "0x..." },
  ];

  const fetchRoles = async (mock: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = mock ? await getMockUserRoles() : await getDiscordUserRoles();
      if (result.error) {
        setError(result.error);
      } else {
        setUserData(result);
      }
    } catch (err) {
      setError("Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchRoles();
    }
  }, [session]);

  const handleMint = async () => {
    if (!isConnected || !userData) return;
    setMinting(true);
    try {
      const node = document.getElementById("card-capture-area");
      if (!node) throw new Error("Card element not found");
      const dataUrl = await toPng(node, { quality: 0.95 });
      console.log("Image Captured:", dataUrl.slice(0, 50) + "...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMinted(true);
    } catch (err) {
      console.error(err);
      setError("Failed to mint card.");
    } finally {
      setMinting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-32 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mb-8 border border-white/10 shadow-2xl"
        >
          <Wallet className="text-white/20" size={48} />
        </motion.div>
        <h1 className="text-4xl font-outfit font-black mb-4 tracking-tight">Connect Wallet</h1>
        <p className="text-white/40 max-w-md mb-10 leading-relaxed font-medium">Please connect your wallet to access your Ritual TCG profile and manage your cards.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Sidebar: User Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                  {session?.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-outfit font-black tracking-tight truncate">
                    {session?.user?.name || "Ritual Explorer"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <p className="text-white/40 text-xs font-mono truncate">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                  </div>
                  {!session && (
                    <button 
                      onClick={() => signIn("discord")}
                      className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 hover:bg-[#5865F2]/20 transition-all group"
                    >
                      <span className="text-[10px] font-black text-[#5865F2] uppercase tracking-wider">Connect Discord</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 group/item hover:border-white/10 transition-all">
                  <p className="text-[10px] uppercase font-bold text-white/30 mb-2 tracking-[0.2em]">Wallet Address</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-white/60 truncate max-w-[200px]">{address}</p>
                    <ExternalLink size={14} className="text-white/20 hover:text-white cursor-pointer transition-all" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 group/item hover:border-white/10 transition-all">
                  <p className="text-[10px] uppercase font-bold text-white/30 mb-2 tracking-[0.2em]">Ritual Balance</p>
                  <div className="flex items-center justify-between">
                    <p className="font-outfit font-bold text-2xl tracking-tight">
                      {balance?.formatted.slice(0, 8)} <span className="text-white/40 text-sm ml-1">{balance?.symbol}</span>
                    </p>
                    <RefreshCcw size={14} className="text-white/20 hover:text-white cursor-pointer transition-all" />
                  </div>
                </div>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-600/5 blur-3xl rounded-full" />
          </div>

          {session && (
            <div className="p-8 rounded-[40px] bg-white/5 border border-white/10">
              <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
                <Tag size={20} className="text-white/40" /> Performance Stats
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-5 rounded-2xl bg-black/20 border border-white/5">
                  <p className="text-3xl font-outfit font-black tracking-tight">{MOCK_OWNED.length}</p>
                  <p className="text-[10px] uppercase font-bold text-white/30 tracking-[0.15em] mt-1">Owned</p>
                </div>
                <div className="text-center p-5 rounded-2xl bg-black/20 border border-white/5">
                  <p className="text-3xl font-outfit font-black tracking-tight">0</p>
                  <p className="text-[10px] uppercase font-bold text-white/30 tracking-[0.15em] mt-1">Listed</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content: Tabs & Grid */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center gap-10 border-b border-white/5 overflow-x-auto scrollbar-hide pb-0.5">
            {[
              { id: "cards", label: "My Cards", icon: <Grid size={18} /> },
              { id: "create", label: "Create Card", icon: <PlusCircle size={18} /> },
              { id: "offers", label: "Offers Received", icon: <History size={18} /> },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 pb-6 text-lg font-bold tracking-tight transition-all relative whitespace-nowrap ${
                  activeTab === tab.id ? "text-white" : "text-white/30 hover:text-white/50"
                }`}
              >
                {tab.icon} {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === "cards" && (
                <motion.div 
                  key="cards"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-10"
                >
                  {MOCK_OWNED.map(card => (
                    <NFTCard key={card.id} {...card} />
                  ))}
                  {MOCK_OWNED.length === 0 && (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
                      <p className="text-white/20 font-bold text-xl mb-6">You don&apos;t own any Ritual cards yet.</p>
                      <button 
                        onClick={() => setActiveTab("create")}
                        className="px-8 py-3 bg-white text-black rounded-xl font-black hover:bg-white/90 transition-all"
                      >
                        Create your first card
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "create" && (
                <motion.div 
                  key="create"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-12"
                >
                  {!session ? (
                    <div className="p-12 rounded-[40px] bg-white/5 border border-white/10 text-center relative overflow-hidden group">
                      <div className="relative z-10">
                        <div className="w-20 h-20 bg-[#5865F2]/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                          <Sparkles className="text-[#5865F2]" size={36} />
                        </div>
                        <h2 className="text-3xl font-outfit font-black mb-4 tracking-tight">Discord Verification</h2>
                        <p className="text-white/40 mb-10 max-w-sm mx-auto leading-relaxed">Connect your Discord account to verify your Ritual roles and generate your unique card.</p>
                        <button 
                          onClick={() => signIn("discord")}
                          className="px-10 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 mx-auto"
                        >
                          <LogIn size={22} /> Connect Discord
                        </button>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#5865F2]/10 blur-[80px] rounded-full" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
                      {/* Left: Preview */}
                      <div className="flex flex-col items-center gap-8">
                        <div className="relative group">
                          <AnimatePresence mode="wait">
                            {userData ? (
                              <CardPreview 
                                role={userData.role} 
                                username={userData.username} 
                                avatar={userData.avatar} 
                                stats={userData.stats}
                                walletAddress={address}
                              />
                            ) : (
                              <div className="w-[340px] h-[480px] rounded-[40px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-10 text-center bg-white/[0.02]">
                                {loading ? (
                                  <Loader2 className="animate-spin text-purple-500 mb-6" size={40} />
                                ) : (
                                  <AlertCircle className="text-white/20 mb-6" size={40} />
                                )}
                                <p className="text-white/20 font-bold tracking-tight">{loading ? "Syncing Ritual Data..." : "Verification Pending"}</p>
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Right: Steps */}
                      <div className="space-y-6">
                        <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 relative overflow-hidden">
                          <h3 className="text-2xl font-outfit font-black mb-8 flex items-center gap-3 tracking-tight">
                            <Wand2 size={24} className="text-purple-400" /> Card Genesis
                          </h3>
                          
                          <div className="space-y-8 mb-10">
                            {[
                              { label: "Discord Authorized", detail: userData ? `Verified as ${userData.username}` : "Session required", active: !!userData },
                              { label: "Role Verification", detail: userData ? `Tier: ${userData.role.name}` : "Checking roles...", active: !!userData },
                              { label: "Genesis Mint", detail: isConnected ? "Ready for Ritual Testnet" : "Connect wallet", active: isConnected }
                            ].map((step, i) => (
                              <div key={i} className="flex items-center gap-5">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all ${step.active ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-white/5 text-white/20 border border-white/10'}`}>
                                  {step.active ? <CheckCircle2 size={20} /> : i + 1}
                                </div>
                                <div>
                                  <p className={`font-bold tracking-tight ${step.active ? 'text-white' : 'text-white/40'}`}>{step.label}</p>
                                  <p className="text-xs text-white/30 font-medium mt-0.5">{step.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {!minted && !hasAlreadyMinted ? (
                            <button
                              disabled={!userData || !isConnected || minting}
                              onClick={handleMint}
                              className="w-full py-5 bg-white text-black disabled:bg-white/5 disabled:text-white/10 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl"
                            >
                              {minting ? (
                                <>
                                  <Loader2 className="animate-spin" size={24} /> Processing...
                                </>
                              ) : (
                                <>
                                  Generate Legacy Card <ChevronRight size={24} />
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <div className={`p-5 rounded-2xl text-sm font-bold flex items-center gap-3 ${hasAlreadyMinted ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                                {hasAlreadyMinted ? <AlertCircle size={20} className="shrink-0" /> : <CheckCircle2 size={20} className="shrink-0" />}
                                <p>{hasAlreadyMinted ? "You have already minted your unique Legacy Card for this Discord profile." : "Legacy Card successfully minted to your wallet!"}</p>
                              </div>
                              <button 
                                onClick={() => setActiveTab("cards")}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black transition-all border border-white/10"
                              >
                                View My Collection
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {error && (
                          <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-start gap-3">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p>{error}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "offers" && (
                <motion.div 
                  key="offers"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="py-24 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[40px]"
                >
                  <p className="text-white/20 font-bold text-xl">No offers received yet.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
