"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, createPublicClient, http } from "viem";
import { motion, AnimatePresence } from "framer-motion";
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
  ShieldCheck,
  Edit3,
  Loader2,
  List,
  Check,
  ArrowRight,
  Upload,
  RefreshCw,
  Trash2,
  X
} from "lucide-react";
import Link from "next/link";
import { CONTRACTS, ROLE_COLORS, RITUAL_NETWORK } from "@/lib/config";
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

function roleColors(role?: string) {
  const roleType = (role || "ritualist").toLowerCase();
  return (ROLE_COLORS as any)[roleType] || ROLE_COLORS.ritualist;
}

export default function CardDetails() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { address } = useAccount();

  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(true);

  // Card details states
  const [metadata, setMetadata] = useState<any>(null);
  const [owner, setOwner] = useState<string>("");
  const [isListed, setIsListed] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [listingId, setListingId] = useState<bigint>(BigInt(0));
  const [listingPrice, setListingPrice] = useState<bigint>(BigInt(0));
  const [offersList, setOffersList] = useState<any[]>([]);

  // Modal / Interaction states
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Input fields
  const [listPrice, setListPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  
  // Custom edit fields
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");

  const { data: txHash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // ─── Fetch All Card Data On-chain and Off-chain ──────────────────────
  const loadCardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const client = getClient();
      
      // 1. Fetch Owner Of Token
      const tokenOwner = await client.readContract({
        address: CONTRACTS.NFT.address,
        abi: CONTRACTS.NFT.abi,
        functionName: "ownerOf",
        args: [BigInt(id)],
      }) as string;
      setOwner(tokenOwner);

      // Check if approved for marketplace
      if (address) {
        try {
          const approved = await client.readContract({
            address: CONTRACTS.NFT.address,
            abi: CONTRACTS.NFT.abi,
            functionName: "isApprovedForAll",
            args: [address, CONTRACTS.MARKETPLACE.address],
          }) as boolean;
          setIsApproved(approved);
        } catch (err) {
          console.error("Failed to check approval", err);
        }
      }

      // 2. Fetch Active Listing
      const actListingId = await client.readContract({
        address: CONTRACTS.MARKETPLACE.address,
        abi: CONTRACTS.MARKETPLACE.abi,
        functionName: "activeListings",
        args: [CONTRACTS.NFT.address, BigInt(id)],
      }) as bigint;

      if (actListingId > BigInt(0)) {
        const listing = await client.readContract({
          address: CONTRACTS.MARKETPLACE.address,
          abi: CONTRACTS.MARKETPLACE.abi,
          functionName: "listings",
          args: [actListingId],
        }) as any;

        const isArray = Array.isArray(listing);
        const active = isArray ? listing[5] : listing.active;
        const listId = isArray ? listing[0] : listing.listingId;
        const price = isArray ? listing[4] : listing.price;

        if (listing && active) {
          setIsListed(true);
          setListingId(listId);
          setListingPrice(price);
        } else {
          setIsListed(false);
        }
      } else {
        setIsListed(false);
      }

      // 3. Fetch Local metadata
      try {
        const res = await fetch(`/api/metadata/${id}?t=${Date.now()}`);
        if (res.ok) {
          const meta = await res.json();
          setMetadata(meta);
          
          // Seed edit fields
          setEditName(meta.name);
          setEditDescription(meta.description);
          setEditImage(meta.image);
        } else {
          throw new Error("Metadata fetch failed");
        }
      } catch (_) {
        // Fallback to on-chain cardData
        try {
          const meta = await client.readContract({
            address: CONTRACTS.NFT.address,
            abi: CONTRACTS.NFT.abi,
            functionName: "cardData",
            args: [BigInt(id)],
          }) as any;

          const discordId = Array.isArray(meta) ? meta[0] : meta.discordId;
          const discordRole = Array.isArray(meta) ? meta[1] : meta.discordRole;
          const discordUsername = Array.isArray(meta) ? meta[2] : meta.discordUsername;

          const fallbackPayload = {
            tokenId: id,
            name: discordUsername || `Ritualist #${id}`,
            description: `A unique collectible card from the Ritual TCG ecosystem. This card represents your verified role (${discordRole}) and contribution to the network.`,
            image: `https://cdn.discordapp.com/embed/avatars/${parseInt(discordId || "0") % 6}.png`,
            discordId,
            discordRole,
            discordUsername,
            traits: {
              messageCount: "120",
              level: "5",
              topRole: discordRole,
              daysInServer: "120",
              activity: "Medium"
            },
            customImage: null
          };
          setMetadata(fallbackPayload);
          setEditName(fallbackPayload.name);
          setEditDescription(fallbackPayload.description);
          setEditImage(fallbackPayload.image);
        } catch (err) {
          console.error("Failed to load fallback metadata", err);
        }
      }

      // 4. Fetch Escrow Offers
      try {
        const offerers = await client.readContract({
          address: CONTRACTS.MARKETPLACE.address,
          abi: CONTRACTS.MARKETPLACE.abi,
          functionName: "getOfferers",
          args: [CONTRACTS.NFT.address, BigInt(id)],
        }) as string[];

        const activeOffers: any[] = [];
        for (const offerer of offerers) {
          const offer = await client.readContract({
            address: CONTRACTS.MARKETPLACE.address,
            abi: CONTRACTS.MARKETPLACE.abi,
            functionName: "offers",
            args: [CONTRACTS.NFT.address, BigInt(id), offerer],
          }) as any;

          // offer structure: [offerer, amount, active]
          const offererAddress = Array.isArray(offer) ? offer[0] : offer.offerer;
          const amount = Array.isArray(offer) ? offer[1] : offer.amount;
          const active = Array.isArray(offer) ? offer[2] : offer.active;

          if (active && amount > BigInt(0)) {
            activeOffers.push({
              offerer: offererAddress,
              amount: amount,
            });
          }
        }
        setOffersList(activeOffers.sort((a, b) => Number(b.amount - a.amount))); // sort highest offer first
      } catch (err) {
        console.error("Failed to load offers", err);
      }

    } catch (e) {
      console.error("Failed to load card", e);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCardData();
  }, [loadCardData]);

  // Refresh data on transaction success
  useEffect(() => {
    if (isSuccess) {
      loadCardData();
      setIsOfferModalOpen(false);
      setIsEditModalOpen(false);
      // Only close list modal if the user is already approved (so they just successfully listed/delisted)
      if (isApproved) {
        setIsListModalOpen(false);
      }
    }
  }, [isSuccess, loadCardData, isApproved]);

  const isOwner = address?.toLowerCase() === owner?.toLowerCase();
  const colors = roleColors(metadata?.discordRole);

  // ─── Direct Buying Flow ───────────────────────────────────────────
  const handleBuy = () => {
    if (!isListed || !listingId) return;
    writeContract({
      address: CONTRACTS.MARKETPLACE.address,
      abi: CONTRACTS.MARKETPLACE.abi,
      functionName: "buyItem",
      args: [listingId],
      value: listingPrice,
    });
  };

  // ─── Direct Listing / Selling Flow ────────────────────────────────
  const handleList = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) return;
    try {
      const client = getClient();
      // Check if approved first
      const isApproved = await client.readContract({
        address: CONTRACTS.NFT.address,
        abi: CONTRACTS.NFT.abi,
        functionName: "isApprovedForAll",
        args: [address!, CONTRACTS.MARKETPLACE.address],
      }) as boolean;

      if (!isApproved) {
        writeContract({
          address: CONTRACTS.NFT.address,
          abi: CONTRACTS.NFT.abi,
          functionName: "setApprovalForAll",
          args: [CONTRACTS.MARKETPLACE.address, true],
        });
      } else {
        writeContract({
          address: CONTRACTS.MARKETPLACE.address,
          abi: CONTRACTS.MARKETPLACE.abi,
          functionName: "listItem",
          args: [CONTRACTS.NFT.address, BigInt(id), parseEther(listPrice)],
        });
      }
    } catch (e) {
      console.error("Listing approval check failed", e);
    }
  };

  // ─── Cancel Listing Flow ──────────────────────────────────────────
  const handleCancelListing = () => {
    if (!listingId) return;
    writeContract({
      address: CONTRACTS.MARKETPLACE.address,
      abi: CONTRACTS.MARKETPLACE.abi,
      functionName: "cancelListing",
      args: [listingId],
    });
  };

  // ─── Escrow Bidding Flow ─────────────────────────────────────────
  const handleMakeOffer = () => {
    if (!offerPrice || parseFloat(offerPrice) <= 0) return;
    writeContract({
      address: CONTRACTS.MARKETPLACE.address,
      abi: CONTRACTS.MARKETPLACE.abi,
      functionName: "makeOffer",
      args: [CONTRACTS.NFT.address, BigInt(id)],
      value: parseEther(offerPrice),
    });
  };

  // ─── Cancel Bid Flow ──────────────────────────────────────────────
  const handleCancelOffer = () => {
    writeContract({
      address: CONTRACTS.MARKETPLACE.address,
      abi: CONTRACTS.MARKETPLACE.abi,
      functionName: "cancelOffer",
      args: [CONTRACTS.NFT.address, BigInt(id)],
    });
  };

  // ─── Accept Bid Flow (Owner only) ─────────────────────────────────
  const handleAcceptOffer = (offerer: string) => {
    writeContract({
      address: CONTRACTS.MARKETPLACE.address,
      abi: CONTRACTS.MARKETPLACE.abi,
      functionName: "acceptOffer",
      args: [CONTRACTS.NFT.address, BigInt(id), offerer],
    });
  };

  // ─── Card Image Base64 Upload (Raw Original Image) ─────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Safety guard to avoid Vercel Serverless Function 4.5MB payload limit
    if (file.size > 4.5 * 1024 * 1024) {
      alert("File is too large. Please select an image under 4.5MB to keep it high quality.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ─── Local JSON database Save ─────────────────────────────────────
  const handleSaveMetadata = async () => {
    console.log("handleSaveMetadata triggered!");
    const updatedPayload = {
      ...metadata,
      name: editName,
      description: editDescription,
      image: editImage,
      customImage: (editImage || "").startsWith("data:") ? editImage : null
    };

    console.log("Payload to be sent:", {
      name: updatedPayload.name,
      description: updatedPayload.description,
      imageLength: (updatedPayload.image || "").length,
      imageIsBase64: (updatedPayload.image || "").startsWith("data:")
    });

    try {
      console.log(`Sending POST fetch request to /api/metadata/${id}...`);
      const res = await fetch(`/api/metadata/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });

      console.log(`Fetch response received. HTTP status: ${res.status}`);
      const jsonRes = await res.json();
      console.log("Server response payload:", jsonRes);

      if (res.ok) {
        console.log("Save successful! Closing modal and reloading card...");
        setMetadata(updatedPayload);
        setIsEditModalOpen(false);
        loadCardData();
      } else {
        console.error("Save metadata returned a non-OK status:", res.status);
        alert(`Failed to save metadata to server. Error code: ${res.status}`);
      }
    } catch (err: any) {
      console.error("Critical error during handleSaveMetadata fetch execution:", err);
      alert(`An error occurred while saving: ${err.message || String(err)}`);
    }
  };

  // ─── Sync with Discord Stats Simulator ────────────────────────────
  const handleSyncStats = () => {
    // Simulates syncing fresh stats in this mocked environment
    const upgradedTraits = {
      ...metadata?.traits,
      messageCount: (parseInt(metadata?.traits?.messageCount || "0") + 150).toString(),
      level: (parseInt(metadata?.traits?.level || "1") + 1).toString(),
      activity: "Ultra Master"
    };

    const updatedPayload = {
      ...metadata,
      traits: upgradedTraits
    };

    setMetadata(updatedPayload);
    setEditName(updatedPayload.name || "");
    setEditDescription(updatedPayload.description || "");
    setEditImage(updatedPayload.image || "");
  };

  const userHasActiveOffer = offersList.some(o => o.offerer.toLowerCase() === address?.toLowerCase());

  return (
    <main className="min-h-screen bg-[#121212] text-white font-['Outfit',sans-serif]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <Link 
          href="/marketplace" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8 font-sans font-bold uppercase tracking-wider text-xs"
        >
          <ChevronLeft size={16} /> Back to Arena
        </Link>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-48">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Connecting Ledger Assets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* ── Left Column: Card Render ── */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="sticky top-28"
              >
                <CardPreview
                  tokenId={id}
                  role={{ 
                    type: metadata?.discordRole || "ritualist", 
                    name: metadata?.discordRole || "Ritualist" 
                  }}
                  username={metadata?.name || "Ritualist"}
                  avatar={metadata?.image || ""}
                  stats={metadata?.traits || { messages: "0", level: "1", activity: "New" }}
                  walletAddress={owner}
                />

                <div className="flex justify-center gap-4 mt-8">
                  {isOwner && (
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-6 py-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all text-white font-bold text-sm flex items-center gap-2 shadow-lg"
                    >
                      <Edit3 size={16} /> Edit Card Design
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* ── Right Column: Card Ledger Data & Actions ── */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div 
                  className="flex items-center gap-1.5 mb-3 font-black text-[10px] tracking-widest uppercase font-sans"
                  style={{ color: colors.primary }}
                >
                  <ShieldCheck size={14} /> Verified Ritual Collection card
                </div>
                <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-5">
                  {metadata?.name || `Card #${id}`}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-xs font-bold font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 uppercase">Card Owner</span>
                    <span className="font-mono bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg" style={{ color: colors.primary }}>
                      {(owner || "").slice(0, 8)}...{(owner || "").slice(-6)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 uppercase">Discord ID</span>
                    <span className="text-white/70 font-mono">{metadata?.discordId || "---"}</span>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div 
                className="p-8 rounded-[32px] bg-white/[0.02] border border-white/10 relative overflow-hidden"
                style={{ backdropFilter: "blur(12px)" }}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 font-sans">Ledger Price</p>
                      {isListed ? (
                        <div className="flex items-end gap-2.5">
                          <span className="text-4xl lg:text-5xl font-black leading-none">{formatEther(listingPrice)}</span>
                          <span className="text-lg font-black" style={{ color: colors.primary }}>RITUAL</span>
                        </div>
                      ) : (
                        <div className="text-3xl font-black text-white/40">Not Listed</div>
                      )}
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isOwner ? (
                      // OWNER ACTIONS
                      isListed ? (
                        <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <button
                            onClick={handleCancelListing}
                            disabled={isPending || isConfirming}
                            className="py-4 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                          >
                            <Trash2 size={18} /> {isPending ? "Waiting..." : isConfirming ? "Confirming..." : "Remove Listing"}
                          </button>
                          <button
                            onClick={() => {
                              setListPrice(formatEther(listingPrice));
                              setIsListModalOpen(true);
                            }}
                            className="py-4 bg-purple-600/10 hover:bg-purple-600/20 text-emerald-400 border border-purple-500/20 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2"
                          >
                            <Tag size={18} /> Change Price
                          </button>
                          <button
                            onClick={handleSyncStats}
                            className="py-4 bg-white/[0.04] backdrop-blur-md border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg"
                          >
                            <RefreshCw size={18} /> Sync Discord Stats
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setIsListModalOpen(true)}
                            className="py-4 text-black rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-xl hover:brightness-95"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <Tag size={18} /> List Card for Sale
                          </button>
                          <button
                            onClick={handleSyncStats}
                            className="py-4 bg-white/[0.04] backdrop-blur-md border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg"
                          >
                            <RefreshCw size={18} /> Sync Discord Stats
                          </button>
                        </>
                      )
                    ) : (
                      // BUYER/OFFEROR ACTIONS
                      isListed ? (
                        <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4">
                          <button 
                            onClick={handleBuy}
                            disabled={isPending || isConfirming}
                            className="py-4 text-black rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-xl hover:brightness-95 disabled:opacity-50"
                            style={{ 
                              backgroundColor: colors.primary,
                              boxShadow: `0 4px 20px -3px ${colors.glow}`
                            }}
                          >
                            <ShoppingCart size={18} /> {isPending ? "Waiting..." : isConfirming ? "Confirming..." : "Buy Now"}
                          </button>
                          
                          {userHasActiveOffer ? (
                            <button
                              onClick={handleCancelOffer}
                              disabled={isPending || isConfirming}
                              className="py-4 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <X size={18} /> {isPending ? "Waiting..." : isConfirming ? "Confirming..." : "Cancel My Bid"}
                            </button>
                          ) : (
                            <button 
                              onClick={() => setIsOfferModalOpen(true)}
                              className="py-4 bg-white/[0.04] backdrop-blur-md border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                              <Hand size={18} /> Make Offer
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="col-span-1 sm:col-span-2">
                          {userHasActiveOffer ? (
                            <button
                              onClick={handleCancelOffer}
                              disabled={isPending || isConfirming}
                              className="w-full py-4 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <X size={18} /> {isPending ? "Waiting..." : isConfirming ? "Confirming..." : "Cancel My Bid"}
                            </button>
                          ) : (
                            <button 
                              onClick={() => setIsOfferModalOpen(true)}
                              className="w-full py-4 bg-white/[0.04] backdrop-blur-md border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                              <Hand size={18} /> Make Offer
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Backlit glow */}
                <div 
                  className="absolute -top-32 -right-32 w-80 h-80 blur-[130px] rounded-full opacity-10 pointer-events-none"
                  style={{ backgroundColor: colors.primary }}
                />
              </div>

              {/* Dynamic Tabs Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-8 border-b border-white/5 pb-4 font-sans">
                  <button 
                    onClick={() => setActiveTab("info")}
                    className={`flex items-center gap-2 font-black text-sm uppercase tracking-wider transition-all relative py-2 ${activeTab === "info" ? "text-white" : "text-white/40"}`}
                  >
                    <Info size={16} /> Bio &amp; Stats
                    {activeTab === "info" && (
                      <motion.div layoutId="activeTabDetails" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab("offers")}
                    className={`flex items-center gap-2 font-black text-sm uppercase tracking-wider transition-all relative py-2 ${activeTab === "offers" ? "text-white" : "text-white/40"}`}
                  >
                    <Hand size={16} /> Escrow Bids ({offersList.length})
                    {activeTab === "offers" && (
                      <motion.div layoutId="activeTabDetails" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-2 font-black text-sm uppercase tracking-wider transition-all relative py-2 ${activeTab === "history" ? "text-white" : "text-white/40"}`}
                  >
                    <History size={16} /> Ledger History
                    {activeTab === "history" && (
                      <motion.div layoutId="activeTabDetails" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                    )}
                  </button>
                </div>

                <div className="py-2">
                  {/* Bio & Stats Tab */}
                  {activeTab === "info" && (
                    <div className="space-y-8 leading-relaxed">
                      <p className="text-base text-white/60 font-sans">{metadata?.description || "A unique TCG card."}</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
                        {[
                          { title: "Rarity Tier", val: metadata?.discordRole || "Bitty", glow: true },
                          { title: "Ver. Username", val: `@${metadata?.discordUsername || "user"}` },
                          { title: "Top Server Role", val: metadata?.discordRole || "Bitty" },
                          { title: "Card Ledger ID", val: `#${id}`, glow: true }
                        ].map((item, idx) => (
                          <div key={idx} className="p-4.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-all">
                            <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">{item.title}</span>
                            <span className="font-bold text-sm truncate" style={{ color: item.glow ? colors.primary : undefined }}>{item.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Escrow Bids Tab */}
                  {activeTab === "offers" && (
                    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a]">
                      {offersList.length > 0 ? (
                        <table className="w-full text-left text-sm font-sans">
                          <thead className="bg-white/5 text-white/30 font-black uppercase text-[10px] tracking-widest border-b border-white/5">
                            <tr>
                              <th className="px-6 py-4">Bidder address</th>
                              <th className="px-6 py-4">Bid Price</th>
                              <th className="px-6 py-4 text-right">Ledger actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {offersList.map((item, idx) => (
                              <tr key={idx} className="hover:bg-white/5 transition-all">
                                <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                                  {item.offerer.slice(0, 10)}...{item.offerer.slice(-8)}
                                </td>
                                <td className="px-6 py-4 font-bold text-white">
                                  {formatEther(item.amount)} RITUAL
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {isOwner ? (
                                    <button
                                      onClick={() => handleAcceptOffer(item.offerer)}
                                      disabled={isPending || isConfirming}
                                      className="px-3 py-1.5 rounded-lg bg-green-500 text-black text-xs font-black uppercase hover:brightness-105 transition-all shadow-md shadow-green-500/10 disabled:opacity-50"
                                    >
                                      Accept Bid
                                    </button>
                                  ) : item.offerer.toLowerCase() === address?.toLowerCase() ? (
                                    <button
                                      onClick={handleCancelOffer}
                                      disabled={isPending || isConfirming}
                                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-black uppercase hover:bg-red-500/20 transition-all disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                  ) : (
                                    <span className="text-white/20 text-xs font-bold font-sans">Active Bid</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="py-12 text-center text-white/30 text-sm font-bold font-sans">
                          No active escrow bids on this card.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ledger History Tab */}
                  {activeTab === "history" && (
                    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a]">
                      <table className="w-full text-left text-sm font-sans">
                        <thead className="bg-white/5 text-white/30 font-black uppercase text-[10px] tracking-widest border-b border-white/5">
                          <tr>
                            <th className="px-6 py-4">Ledger Event</th>
                            <th className="px-6 py-4">Event Price</th>
                            <th className="px-6 py-4">Sender</th>
                            <th className="px-6 py-4">Receiver</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {isListed && (
                            <tr className="hover:bg-white/5 transition-all font-mono">
                              <td className="px-6 py-4 font-bold text-white font-sans flex items-center gap-2">
                                <Tag size={14} style={{ color: colors.primary }} /> LISTED
                              </td>
                              <td className="px-6 py-4">{formatEther(listingPrice)} RITUAL</td>
                              <td className="px-6 py-4 text-emerald-400">{(owner || "").slice(0, 6)}...{(owner || "").slice(-4)}</td>
                              <td className="px-6 py-4 text-white/30">MARKETPLACE</td>
                            </tr>
                          )}
                          <tr className="hover:bg-white/5 transition-all font-mono">
                            <td className="px-6 py-4 font-bold text-white font-sans flex items-center gap-2">
                              <Check size={14} style={{ color: colors.primary }} /> MINTED
                            </td>
                            <td className="px-6 py-4">0.01 RITUAL</td>
                            <td className="px-6 py-4 text-white/30">0x0000...0000</td>
                            <td className="px-6 py-4 text-emerald-400">{(owner || "").slice(0, 6)}...{(owner || "").slice(-4)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL: Listing Input Modal ─── */}
      <AnimatePresence>
        {isListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121212] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative shadow-2xl font-sans"
            >
              <button onClick={() => setIsListModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={20} /></button>
              <Tag className="text-emerald-400 mb-4" size={32} />
              <h3 className="text-2xl font-black font-outfit mb-2">Sell Card</h3>
              <p className="text-white/50 text-sm mb-6">
                Input your selling price for <strong className="text-white">Card #{id}</strong>. A 5% platform royalty is applied to successful sales. Listing requires a one-time marketplace approval.
              </p>

              <div className="relative mb-6">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={listPrice}
                  onChange={e => setListPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-black text-xl focus:outline-none focus:border-white/30 transition-all font-outfit"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 font-bold text-sm">RITUAL</span>
              </div>

              <button
                onClick={handleList}
                disabled={isPending || isConfirming || !listPrice || parseFloat(listPrice) <= 0}
                className="w-full py-4 rounded-2xl font-black text-lg bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {isPending ? (
                  "Waiting in Wallet..."
                ) : isConfirming ? (
                  "Confirming on Chain..."
                ) : !isApproved ? (
                  "Approve Marketplace First"
                ) : (
                  "Confirm Listing"
                )}
              </button>
            </motion.div>
          </div>
        )}

        {/* ─── MODAL: Offer Input Modal ─── */}
        {isOfferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121212] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative shadow-2xl font-sans"
            >
              <button onClick={() => setIsOfferModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={20} /></button>
              <Hand className="text-emerald-400 mb-4" size={32} />
              <h3 className="text-2xl font-black font-outfit mb-2">Escrow Bid</h3>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Input your bid for <strong className="text-white">Card #{id}</strong>. Your RITUAL will be locked in the marketplace contract until accepted or cancelled.
              </p>

              <div className="relative mb-6">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={offerPrice}
                  onChange={e => setOfferPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-black text-xl focus:outline-none focus:border-white/30 transition-all font-outfit"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 font-bold text-sm">RITUAL</span>
              </div>

              <button
                onClick={handleMakeOffer}
                disabled={isPending || isConfirming || !offerPrice || parseFloat(offerPrice) <= 0}
                className="w-full py-4 rounded-2xl font-black text-lg bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {isPending ? "Waiting..." : isConfirming ? "Confirming..." : "Submit Escrow Bid"}
              </button>
            </motion.div>
          </div>
        )}

        {/* ─── MODAL: Card Edit Modal ─── */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#121212] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative shadow-2xl font-sans max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={20} /></button>
              <Edit3 className="text-emerald-400 mb-4" size={32} />
              <h3 className="text-2xl font-black font-outfit mb-1">Customize Card</h3>
              <p className="text-white/40 text-xs mb-6">Modify the off-chain styling for your minted NFT. Instantly updates in database.</p>

              <div className="space-y-5">
                {/* Custom Name */}
                <div>
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-2 block">Card Title Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-bold focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>

                {/* Custom Bio Description */}
                <div>
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-2 block">Bio Description</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-white/20 transition-all text-sm leading-relaxed"
                  />
                </div>

                {/* Photo Upload Override */}
                <div>
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-2 block">Custom Photo Override (PNG/JPG)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-white/10 hover:border-white/20 rounded-xl cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                      <Upload size={20} className="text-white/40 mb-1.5" />
                      <span className="text-[10px] font-bold text-white/60">Choose file</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden" 
                      />
                    </label>
                    {editImage && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-black flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={editImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl font-bold text-sm text-white/60 hover:text-white transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveMetadata}
                  className="flex-1 py-3.5 text-black font-black text-sm rounded-xl hover:brightness-105 transition-all"
                  style={{ backgroundColor: colors.primary }}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
