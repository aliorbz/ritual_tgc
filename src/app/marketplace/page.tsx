"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, createPublicClient, http } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Tag, 
  X, 
  Loader2, 
  AlertTriangle, 
  Package, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown 
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

// ─── Types ────────────────────────────────────────────────────────
type CardMeta = { 
  discordId: string; 
  discordRole: string; 
  discordUsername: string;
  image?: string;
  traits?: any;
  description?: string;
};

type Listing = {
  listingId: bigint;
  nftAddress: string;
  tokenId: bigint;
  seller: string;
  price: bigint;
  active: boolean;
  cardMeta?: CardMeta;
};

type MintedCard = {
  tokenId: bigint;
  owner: string;
  cardMeta?: CardMeta;
};

// Helper to resolve role color styles
function roleColors(role?: string) {
  const roleType = (role || "ritualist").toLowerCase();
  return (ROLE_COLORS as any)[roleType] || ROLE_COLORS.ritualist;
}

// ─── Listed Card Component ──────────────────────────────────────────
function ListingCard({ listing, onBuy, onOffer, currentAddress }: {
  listing: Listing;
  onBuy: (listing: Listing) => void;
  onOffer: (listing: Listing) => void;
  currentAddress?: string;
}) {
  const colors = roleColors(listing.cardMeta?.discordRole);
  const isSelf = currentAddress?.toLowerCase() === listing.seller.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group rounded-[32px] overflow-hidden bg-[#0a0a0a]/80 border border-white/5 hover:border-white/20 transition-all duration-500 flex flex-col justify-between"
      style={{ 
        boxShadow: `0 10px 30px -15px ${colors.glow}`,
        backdropFilter: "blur(12px)"
      }}
    >
      {/* Dynamic Card Display */}
      <Link href={`/card/${listing.tokenId}`} className="block p-4 pb-2">
        <div className="flex justify-center transition-transform duration-500 group-hover:scale-[1.02]">
          <CardPreview
            tokenId={listing.tokenId.toString()}
            role={{ 
              type: listing.cardMeta?.discordRole || "ritualist", 
              name: listing.cardMeta?.discordRole || "Ritualist" 
            }}
            username={listing.cardMeta?.discordUsername || "Ritualist"}
            avatar={listing.cardMeta?.image || ""}
            stats={listing.cardMeta?.traits || { messages: "0", level: "1", activity: "New" }}
          />
        </div>
      </Link>

      {/* Action panel */}
      <div className="p-5 border-t border-white/5 bg-black/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Buy Now Price</p>
            <p className="text-white font-black text-xl font-outfit mt-0.5">
              {formatEther(listing.price)} <span className="text-xs font-bold" style={{ color: colors.primary }}>RITUAL</span>
            </p>
          </div>
          {isSelf ? (
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest border border-white/10 px-3 py-2 rounded-xl">Your Listing</span>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onOffer(listing)}
                className="px-3 py-2 rounded-xl border border-white/10 hover:border-white/30 text-white/60 hover:text-white transition-all text-xs font-black"
              >
                Offer
              </button>
              <button
                onClick={() => onBuy(listing)}
                className="px-4 py-2 rounded-xl font-black text-sm text-black hover:brightness-110 transition-all shadow-lg"
                style={{ 
                  backgroundColor: colors.primary,
                  boxShadow: `0 4px 15px -3px ${colors.glow}`
                }}
              >
                Buy
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Unlisted Card Component ────────────────────────────────────────
function UnlistedCard({ card, onOffer, currentAddress }: {
  card: MintedCard;
  onOffer: (card: MintedCard) => void;
  currentAddress?: string;
}) {
  const colors = roleColors(card.cardMeta?.discordRole);
  const isOwner = currentAddress?.toLowerCase() === card.owner.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group rounded-[32px] overflow-hidden bg-[#0a0a0a]/80 border border-white/5 hover:border-white/15 transition-all duration-500 flex flex-col justify-between"
      style={{ backdropFilter: "blur(12px)" }}
    >
      {/* Dynamic Card Display */}
      <Link href={`/card/${card.tokenId}`} className="block p-4 pb-2">
        <div className="flex justify-center transition-transform duration-500 group-hover:scale-[1.02]">
          <CardPreview
            tokenId={card.tokenId.toString()}
            role={{ 
              type: card.cardMeta?.discordRole || "ritualist", 
              name: card.cardMeta?.discordRole || "Ritualist" 
            }}
            username={card.cardMeta?.discordUsername || "Ritualist"}
            avatar={card.cardMeta?.image || ""}
            stats={card.cardMeta?.traits || { messages: "0", level: "1", activity: "New" }}
          />
        </div>
      </Link>

      {/* Action panel */}
      <div className="p-5 border-t border-white/5 bg-black/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Market Status</p>
            <p className="text-white/40 font-black text-sm mt-0.5">Not Listed</p>
          </div>
          {isOwner ? (
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest border border-white/10 px-3 py-2 rounded-xl">Your Card</span>
          ) : (
            <button
              onClick={() => onOffer(card)}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/30 text-white/80 hover:text-white transition-all text-xs font-black"
            >
              Make Offer
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Buy Modal Component ───────────────────────────────────────────
function BuyModal({ listing, onClose, onSuccess }: { listing: Listing; onClose: () => void; onSuccess?: () => void }) {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && onSuccess) onSuccess();
  }, [isSuccess, onSuccess]);

  const handleBuy = () => {
    writeContract({
      address: CONTRACTS.MARKETPLACE.address,
      abi: CONTRACTS.MARKETPLACE.abi,
      functionName: "buyItem",
      args: [listing.listingId],
      value: listing.price,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0b0b0b] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={20} /></button>
        <ShoppingCart className="text-purple-400 mb-4" size={32} />
        <h3 className="text-2xl font-black font-outfit mb-2">Confirm Purchase</h3>
        <p className="text-white/50 text-sm mb-6">
          You are buying <strong className="text-white">Card #{listing.tokenId.toString()}</strong> from{" "}
          <strong className="text-white">@{listing.cardMeta?.discordUsername || "Unknown"}</strong>.
        </p>

        <div className="bg-white/5 rounded-2xl p-4 mb-6 flex justify-between items-center border border-white/5">
          <span className="text-white/40 text-sm font-bold">You pay</span>
          <span className="text-white font-black text-xl font-outfit">{formatEther(listing.price)} RITUAL</span>
        </div>

        <div className="text-[10px] text-white/30 font-bold mb-6 flex items-center gap-2">
          <AlertTriangle size={12} className="text-yellow-500" />
          Seller receives 95% · 5% platform fee
        </div>

        {isSuccess ? (
          <div className="text-center py-4">
            <p className="text-green-400 font-black text-lg">🎉 Card Purchased Successfully!</p>
            <button onClick={onClose} className="mt-4 text-white/50 text-sm hover:text-white font-bold">Close</button>
          </div>
        ) : (
          <button
            onClick={handleBuy}
            disabled={isPending || isConfirming}
            className="w-full py-4 rounded-2xl font-black text-lg bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {isPending ? "Waiting in Wallet..." : isConfirming ? "Confirming..." : `Buy for ${formatEther(listing.price)} RITUAL`}
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ─── Offer Modal Component ──────────────────────────────────────────
type OfferTarget = { tokenId: bigint; discordUsername?: string };

function OfferModal({ target, onClose, onSuccess }: { target: OfferTarget; onClose: () => void; onSuccess?: () => void }) {
  const [offerAmount, setOfferAmount] = useState("");
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && onSuccess) onSuccess();
  }, [isSuccess, onSuccess]);

  const handleOffer = () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) return;
    writeContract({
      address: CONTRACTS.MARKETPLACE.address,
      abi: CONTRACTS.MARKETPLACE.abi,
      functionName: "makeOffer",
      args: [CONTRACTS.NFT.address, target.tokenId],
      value: parseEther(offerAmount),
    });
  };

  const errMsg = error ? ((error as any)?.shortMessage || error?.message) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0b0b0b] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={20} /></button>
        <Tag className="text-purple-400 mb-4" size={32} />
        <h3 className="text-2xl font-black font-outfit mb-2">Make an Offer</h3>
        <p className="text-white/50 text-sm mb-6 leading-relaxed">
          For <strong className="text-white">Card #{target.tokenId.toString()}</strong>
          {target.discordUsername ? <> owned by <strong className="text-white">@{target.discordUsername}</strong></> : null}.
          Your RITUAL will be escrowed safely in the marketplace contract until accepted or cancelled.
        </p>

        <div className="relative mb-6">
          <input
            type="number"
            min="0"
            step="0.001"
            placeholder="0.00"
            value={offerAmount}
            onChange={e => setOfferAmount(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-black text-xl focus:outline-none focus:border-white/30 transition-all font-outfit"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 font-bold text-sm">RITUAL</span>
        </div>

        {errMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs font-bold text-red-400">{errMsg}</p>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-4">
            <p className="text-green-400 font-black text-lg">✅ Offer Escrowed!</p>
            <p className="text-white/40 text-xs mt-1">You can cancel it anytime from the card detail page.</p>
            <button onClick={onClose} className="mt-4 text-white/50 text-sm hover:text-white font-bold">Close</button>
          </div>
        ) : (
          <button
            onClick={handleOffer}
            disabled={isPending || isConfirming || !offerAmount || parseFloat(offerAmount) <= 0}
            className="w-full py-4 rounded-2xl font-black text-lg bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {isPending ? "Waiting in Wallet..." : isConfirming ? "Confirming..." : "Submit Offer"}
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ─── Main Marketplace Page ──────────────────────────────────────────
export default function MarketplacePage() {
  const { address } = useAccount();

  const [listings, setListings] = useState<Listing[]>([]);
  const [unlistedCards, setUnlistedCards] = useState<MintedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBuy, setSelectedBuy] = useState<Listing | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<OfferTarget | null>(null);

  // Search & Filter controls
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("recent");

  const roles = ["All", "Mod", "Radiant", "Ritualist", "Ritty", "Bitty"];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const client = getClient();

      // ── Step 1: Fetch all active listings ────────────────────────
      const MAX_LISTING_SCAN = 200;
      const activeListings: Listing[] = [];

      for (let i = 1; i <= MAX_LISTING_SCAN; i++) {
        try {
          const data = await client.readContract({
            address: CONTRACTS.MARKETPLACE.address,
            abi: CONTRACTS.MARKETPLACE.abi,
            functionName: "listings",
            args: [BigInt(i)],
          }) as unknown as { listingId: bigint; nftAddress: string; tokenId: bigint; seller: string; price: bigint; active: boolean };

          if (!data || data.listingId === BigInt(0)) break;
          if (!data.active) continue;

          const listing: Listing = {
            listingId: data.listingId,
            nftAddress: data.nftAddress,
            tokenId: data.tokenId,
            seller: data.seller,
            price: data.price,
            active: data.active,
          };

          // Fetch local JSON metadata or fall back to on-chain
          try {
            const res = await fetch(`/api/metadata/${listing.tokenId}`);
            if (res.ok) {
              const meta = await res.json();
              listing.cardMeta = {
                discordId: meta.discordId,
                discordRole: meta.discordRole,
                discordUsername: meta.name,
                image: meta.image,
                traits: meta.traits,
                description: meta.description
              };
            } else {
              throw new Error("Metadata API error");
            }
          } catch (_) {
            // Fallback to on-chain raw cardData
            try {
              const meta = await client.readContract({
                address: CONTRACTS.NFT.address,
                abi: CONTRACTS.NFT.abi,
                functionName: "cardData",
                args: [listing.tokenId],
              }) as unknown as { discordId: string; discordRole: string; discordUsername: string };

              listing.cardMeta = {
                discordId: Array.isArray(meta) ? (meta as any)[0] : meta.discordId,
                discordRole: Array.isArray(meta) ? (meta as any)[1] : meta.discordRole,
                discordUsername: Array.isArray(meta) ? (meta as any)[2] : meta.discordUsername,
              };
            } catch (err) {
              console.error(`Failed to load card metadata for ${listing.tokenId}`, err);
            }
          }

          activeListings.push(listing);
        } catch (_) {
          break;
        }
      }

      setListings(activeListings);
      const listedTokenIds = new Set(activeListings.map(l => l.tokenId.toString()));

      // ── Step 2: Fetch all minted cards ──
      let totalSupply = 0;
      try {
        const ts = await client.readContract({
          address: CONTRACTS.NFT.address,
          abi: CONTRACTS.NFT.abi,
          functionName: "totalSupply",
          args: [],
        }) as bigint;
        totalSupply = Number(ts);
      } catch (_) {}

      const unlisted: MintedCard[] = [];

      for (let i = 0; i < totalSupply; i++) {
        try {
          const tokenId = await client.readContract({
            address: CONTRACTS.NFT.address,
            abi: CONTRACTS.NFT.abi,
            functionName: "tokenByIndex",
            args: [BigInt(i)],
          }) as bigint;

          if (listedTokenIds.has(tokenId.toString())) continue;

          const owner = await client.readContract({
            address: CONTRACTS.NFT.address,
            abi: CONTRACTS.NFT.abi,
            functionName: "ownerOf",
            args: [tokenId],
          }) as string;

          const card: MintedCard = { tokenId, owner };

          // Fetch local JSON metadata or fall back to on-chain
          try {
            const res = await fetch(`/api/metadata/${tokenId}`);
            if (res.ok) {
              const meta = await res.json();
              card.cardMeta = {
                discordId: meta.discordId,
                discordRole: meta.discordRole,
                discordUsername: meta.name,
                image: meta.image,
                traits: meta.traits,
                description: meta.description
              };
            } else {
              throw new Error("Metadata API error");
            }
          } catch (_) {
            try {
              const meta = await client.readContract({
                address: CONTRACTS.NFT.address,
                abi: CONTRACTS.NFT.abi,
                functionName: "cardData",
                args: [tokenId],
              }) as unknown as { discordId: string; discordRole: string; discordUsername: string };

              card.cardMeta = {
                discordId: Array.isArray(meta) ? (meta as any)[0] : meta.discordId,
                discordRole: Array.isArray(meta) ? (meta as any)[1] : meta.discordRole,
                discordUsername: Array.isArray(meta) ? (meta as any)[2] : meta.discordUsername,
              };
            } catch (_) {}
          }

          unlisted.push(card);
        } catch (_) {
          continue;
        }
      }

      setUnlistedCards(unlisted);
    } catch (e) {
      console.error("Failed to fetch marketplace data", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtering & Sorting function
  const filterAndSortCards = <T extends { tokenId: bigint; cardMeta?: CardMeta; price?: bigint }>(items: T[]) => {
    return items
      .filter(item => {
        const meta = item.cardMeta;
        const name = meta?.discordUsername || "";
        const role = meta?.discordRole || "";
        const id = item.tokenId.toString();
        
        const matchesSearch = 
          name.toLowerCase().includes(search.toLowerCase()) || 
          role.toLowerCase().includes(search.toLowerCase()) || 
          id === search;
          
        const matchesFilter = 
          filter === "All" || 
          role.toLowerCase() === filter.toLowerCase() ||
          (filter === "Radiant" && (role.toLowerCase() === "raiden" || role.toLowerCase() === "radiant"));
          
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sort === "id") {
          return Number(a.tokenId - b.tokenId);
        }
        if (sort === "price_asc" && a.price !== undefined && b.price !== undefined) {
          return Number(a.price - b.price);
        }
        if (sort === "price_desc" && a.price !== undefined && b.price !== undefined) {
          return Number(b.price - a.price);
        }
        // recent
        return Number(b.tokenId - a.tokenId);
      });
  };

  const filteredListings = filterAndSortCards(listings);
  const filteredUnlisted = filterAndSortCards(unlistedCards);

  const totalMinted = listings.length + unlistedCards.length;

  return (
    <main className="min-h-screen bg-[#080808] text-white font-['Outfit',sans-serif]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold tracking-widest mb-3 inline-block uppercase font-sans">
              Ritual TCG Trading Arena
            </span>
            <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white">Marketplace</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-[11px] font-bold text-white/30 uppercase tracking-widest font-sans">
              <span>5% Royalty fee</span>
              <span>·</span>
              <span>Gasless transactions</span>
              <span>·</span>
              {!isLoading && <span>{totalMinted} dynamic card{totalMinted !== 1 ? "s" : ""} minted</span>}
              <span>·</span>
              <span className="text-purple-400/80 font-mono lowercase tracking-normal">{CONTRACTS.MARKETPLACE.address}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Search, Filter, Sort Controls Panel */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-md mb-12">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
            <div className="relative w-full sm:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, ID, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-sans"
              />
            </div>
            
            {/* Dynamic HSL Glowing Role Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full sm:w-auto font-sans">
              {roles.map(role => {
                const colors = roleColors(role);
                const isActive = filter === role;
                
                return (
                  <button
                    key={role}
                    onClick={() => setFilter(role)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                      isActive 
                      ? "text-white shadow-lg" 
                      : "bg-white/5 text-white/40 border-transparent hover:bg-white/10"
                    }`}
                    style={{ 
                      backgroundColor: isActive ? colors.primary : undefined,
                      borderColor: isActive ? colors.primary : undefined,
                      boxShadow: isActive ? `0 10px 20px -5px ${colors.glow}` : undefined
                    }}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-3 self-end lg:self-auto font-sans">
            <div className="relative flex items-center bg-black/40 border border-white/5 rounded-2xl px-4 py-3 gap-2">
              <ArrowUpDown size={16} className="text-white/40" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="recent" className="bg-[#111]">Recently Minted</option>
                <option value="price_asc" className="bg-[#111]">Price: Low to High</option>
                <option value="price_desc" className="bg-[#111]">Price: High to Low</option>
                <option value="id" className="bg-[#111]">Card ID</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-48">
            <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Gathering On-chain Assets...</p>
          </div>
        ) : totalMinted === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
            <Package className="text-white/10 mb-6" size={64} />
            <h3 className="text-2xl font-black mb-2">No Cards Minted Yet</h3>
            <p className="text-white/30 text-sm">Verify your Discord roles on your Profile page to mint your first card!</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* ── Active Listings Section ──────────────────────────── */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tight">Active Listings</h2>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black text-white/40 font-sans">
                  {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.listingId.toString()}
                      listing={listing}
                      onBuy={setSelectedBuy}
                      onOffer={(l) => setSelectedOffer({ tokenId: l.tokenId, discordUsername: l.cardMeta?.discordUsername })}
                      currentAddress={address}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center rounded-[32px] border border-white/5 bg-white/[0.01] text-white/30 text-sm font-bold">
                  No active listings match your filters.
                </div>
              )}
            </div>

            {/* ── Unlisted Cards Section ───────────────────────────── */}
            <div>
              <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-black uppercase tracking-tight">Escrow Bidding Arena</h2>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black text-white/40 font-sans">
                    {filteredUnlisted.length} unlisted
                  </span>
                </div>
                <p className="text-white/40 text-sm font-sans">These cards are owned but not currently listed for direct sale. You can still make bids on them.</p>
              </div>

              {filteredUnlisted.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredUnlisted.map((card) => (
                    <UnlistedCard
                      key={card.tokenId.toString()}
                      card={card}
                      onOffer={(c) => setSelectedOffer({ tokenId: c.tokenId, discordUsername: c.cardMeta?.discordUsername })}
                      currentAddress={address}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center rounded-[32px] border border-white/5 bg-white/[0.01] text-white/30 text-sm font-bold">
                  No unlisted cards match your filters.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Modals */}
      <AnimatePresence>
        {selectedBuy && (
          <BuyModal
            listing={selectedBuy}
            onClose={() => setSelectedBuy(null)}
            onSuccess={() => { setSelectedBuy(null); fetchData(); }}
          />
        )}
        {selectedOffer && (
          <OfferModal
            target={selectedOffer}
            onClose={() => setSelectedOffer(null)}
            onSuccess={() => { setSelectedOffer(null); }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
