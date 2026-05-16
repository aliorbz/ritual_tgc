"use client";

import React from "react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, parseEther } from "viem";
import { useSession, signIn } from "next-auth/react";
import { User, Wallet, Grid, PlusCircle, Settings, ExternalLink, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RITUAL_NETWORK, ROLE_COLORS, CONTRACTS } from "@/lib/config";
import { Navbar } from "@/components/Navbar";
import { CardPreview } from "@/components/CardPreview";
import { getDiscordUserRoles } from "@/lib/actions";

export default function ProfilePage() {
  const { isConnected, address } = useAccount();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = React.useState("cards");
  const [userData, setUserData] = React.useState<any>(null);
  const [isRoleLoading, setIsRoleLoading] = React.useState(false);
  const [customImage, setCustomImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Wagmi Write Contract Hook
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleMint = async () => {
    if (!address || !userData || !session) return;
    try {
      writeContract({
        address: CONTRACTS.NFT.address as `0x${string}`,
        abi: CONTRACTS.NFT.abi,
        functionName: 'mintCard',
        args: [
          address,
          (session as any).user?.id || "",
          userData.role.name,
          userData.trueUsername || session.user?.name || "user"
        ],
        value: parseEther("0.01"),
      });
    } catch (e) {
      console.error("Minting failed", e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  React.useEffect(() => {
    async function loadRoles() {
      if (session) {
        setIsRoleLoading(true);
        const data = await getDiscordUserRoles();
        if (!data.error) {
          setUserData(data);
        } else {
          // Fallback to basic Ritualist if server check fails
          setUserData({
            role: { type: "ritualist", name: "Ritualist" },
            stats: { messages: "0", joins: "---", activity: "New" }
          });
        }
        setIsRoleLoading(false);
      }
    }
    loadRoles();
  }, [session]);

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
                  className="px-3 py-1 rounded-lg border transition-all"
                  style={{ 
                    backgroundColor: isRoleLoading ? "rgba(255,255,255,0.05)" : (ROLE_COLORS as any)[userData?.role?.type || "ritualist"]?.bg, 
                    borderColor: isRoleLoading ? "rgba(255,255,255,0.1)" : (ROLE_COLORS as any)[userData?.role?.type || "ritualist"]?.border 
                  }}
                >
                  <span 
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${(ROLE_COLORS as any)[userData?.role?.type || "ritualist"]?.text || "text-white"}`}
                  >
                    {isRoleLoading ? "Fetching Role..." : (userData?.role?.name || "Ritualist")}
                  </span>
                </div>
                {session && !isRoleLoading && <ShieldCheck className="text-blue-500" size={18} />}
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
                <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-start w-full max-w-5xl mt-10">
                  {/* Left: Card Preview */}
                  <div className="flex-1 flex justify-center lg:justify-end">
                    <CardPreview 
                      username={session.user?.name || "Ritualist"}
                      avatar={customImage || session.user?.image || ""}
                      role={userData?.role || { type: "ritualist", name: "Ritualist" }}
                      walletAddress={address}
                      stats={userData?.stats || { messages: "---", joins: "---", activity: "---" }}
                    />
                  </div>

                  {/* Right: Typography & Mint Actions */}
                  <div className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left pt-4">
                    {/* Top Verified Tag */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShieldCheck size={14} className={(ROLE_COLORS as any)[userData?.role?.type || "ritualist"]?.text || "text-blue-500"} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${(ROLE_COLORS as any)[userData?.role?.type || "ritualist"]?.text || "text-blue-500"}`}>
                        Ritual Verified
                      </span>
                    </div>

                    {/* Name & Role */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <h1 className="text-6xl font-black uppercase tracking-tighter text-white">
                        {session.user?.name}
                      </h1>
                      <span className={`text-2xl font-black lowercase ${(ROLE_COLORS as any)[userData?.role?.type || "ritualist"]?.text || "text-blue-500"}`}>
                        ({userData?.role?.name || "ritualist"})
                      </span>
                    </div>

                    {/* Sub-info */}
                    <div className="flex items-center gap-4 text-sm font-bold mb-10">
                      <span className="text-white/40">Discord: <span className={(ROLE_COLORS as any)[userData?.role?.type || "ritualist"]?.text || "text-blue-500"}>@{userData?.trueUsername || (session.user?.name || "user").toLowerCase().replace(/\s+/g, '')}</span></span>
                      <span className="text-white/40">Address: <span className={(ROLE_COLORS as any)[userData?.role?.type || "ritualist"]?.text || "text-blue-500"}>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "0x..."}</span></span>
                    </div>

                    {/* Mint Button */}
                    <button 
                      disabled={isRoleLoading || isPending || isConfirming || isConfirmed}
                      onClick={handleMint}
                      className="w-full max-w-sm py-5 rounded-[20px] font-black text-2xl uppercase tracking-tighter transition-all active:scale-95 flex items-center justify-center gap-3 text-black hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: (ROLE_COLORS as any)[userData?.role?.type || "ritualist"]?.primary || "#3b82f6",
                        boxShadow: `0 10px 30px -10px ${(ROLE_COLORS as any)[userData?.role?.type || "ritualist"]?.primary || "#3b82f6"}`
                      }}
                    >
                      {isRoleLoading ? "Syncing..." : isPending ? "Waiting in Wallet..." : isConfirming ? "Minting on Chain..." : isConfirmed ? "Successfully Minted!" : "Mint TCG"}
                    </button>

                    {/* Mint Info */}
                    <div className="flex items-center gap-6 mt-6 lg:ml-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      <div>Fee: <span className="text-white/70">0.01 RITUAL</span></div>
                      <div>Contract: <span className="text-white/70">{CONTRACTS.NFT.address.slice(0,6)}...{CONTRACTS.NFT.address.slice(-4)}</span></div>
                    </div>

                    {/* Manual Upload */}
                    <div className="mt-8 flex flex-col lg:items-start items-center">
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                      <p className="text-sm font-bold text-white mb-1">
                        low image resolution?{" "}
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className={`uppercase underline hover:brightness-125 transition-all ${(ROLE_COLORS as any)[userData?.role?.type || "ritualist"]?.text || "text-blue-500"}`}
                        >
                          upload
                        </button>
                        {" "}manually!
                      </p>
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">
                        uploaded image can't be changed afterwards
                      </p>
                    </div>
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
