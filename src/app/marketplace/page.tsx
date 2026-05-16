"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Tag, X, Loader2, AlertTriangle } from "lucide-react";
import { CONTRACTS, ROLE_COLORS } from "@/lib/config";
import { Navbar } from "@/components/Navbar";

// ─── Types ───────────────────────────────────────────────────────────
type Listing = {
  listingId: bigint;
  nftAddress: string;
  tokenId: bigint;
  seller: string;
  price: bigint;
  active: boolean;
  cardMeta?: { discordUsername: string; discordRole: string; discordId: string };
};

// ─── Sub-components ────────────────────────────────────────────────
function ListingCard({ listing, onBuy, onOffer, currentAddress }: {
  listing: Listing;
  onBuy: (listing: Listing) => void;
  onOffer: (listing: Listing) => void;
  currentAddress?: string;
}) {
  const roleType = (listing.cardMeta?.discordRole || "ritualist").toLowerCase();
  const colors = (ROLE_COLORS as any)[roleType] || ROLE_COLORS.ritualist;
  const isSelf = currentAddress?.toLowerCase() === listing.seller.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group rounded-[28px] overflow-hidden bg-[#0d0d0d] border border-white/10 hover:border-white/20 transition-all duration-300"
      style={{ boxShadow: `0 0 40px -20px ${colors.glow}` }}
    >
      {/* Card art strip */}
      <div className="h-40 bg-gradient-to-br from-white/5 to-black/40 relative overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at 50% 50%, ${colors.primary}, transparent 70%)` }}
        />
        <div
          className="w-20 h-20 rounded-2xl text-center font-black text-5xl flex items-center justify-center"
          style={{ color: colors.primary }}
        >
          #{listing.tokenId.toString()}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="font-black text-white text-lg truncate">
          {listing.cardMeta?.discordUsername || "Unknown"}
        </p>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: colors.primary }}>
          {listing.cardMeta?.discordRole || "Ritualist"}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/30 uppercase font-bold">Price</p>
            <p className="text-white font-black text-xl">{formatEther(listing.price)} <span className="text-xs text-white/50">RITUAL</span></p>
          </div>
          {isSelf ? (
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest border border-white/10 px-3 py-2 rounded-xl">Your Listing</span>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onOffer(listing)}
                className="px-3 py-2 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-xs font-black"
              >
                Offer
              </button>
              <button
                onClick={() => onBuy(listing)}
                className="px-4 py-2 rounded-xl font-black text-sm text-black hover:brightness-110 transition-all"
                style={{ backgroundColor: colors.primary }}
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

// ─── Buy Modal ─────────────────────────────────────────────────────
function BuyModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleBuy = () => {
    writeContract({
      address: CONTRACTS.MARKETPLACE.address as `0x${string}`,
      abi: CONTRACTS.MARKETPLACE.abi,
      functionName: "buyItem",
      args: [listing.listingId],
      value: listing.price,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#111] border border-white/10 rounded-[28px] p-8 max-w-sm w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white"><X size={20} /></button>
        <ShoppingCart className="text-white/40 mb-4" size={32} />
        <h3 className="text-2xl font-black mb-2">Confirm Purchase</h3>
        <p className="text-white/40 text-sm mb-6">
          You are buying <strong className="text-white">Card #{listing.tokenId.toString()}</strong> from{" "}
          <strong className="text-white">{listing.cardMeta?.discordUsername || "Unknown"}</strong>
        </p>

        <div className="bg-white/5 rounded-2xl p-4 mb-6 flex justify-between items-center">
          <span className="text-white/50 text-sm font-bold">You pay</span>
          <span className="text-white font-black text-xl">{formatEther(listing.price)} RITUAL</span>
        </div>

        <div className="text-[10px] text-white/30 font-bold mb-6 flex items-center gap-2">
          <AlertTriangle size={12} />
          Seller receives 95% · 5% platform fee
        </div>

        {isSuccess ? (
          <div className="text-center py-4">
            <p className="text-green-400 font-black text-lg">🎉 Card Purchased!</p>
            <button onClick={onClose} className="mt-4 text-white/50 text-sm hover:text-white">Close</button>
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

// ─── Offer Modal ────────────────────────────────────────────────────
function OfferModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const [offerAmount, setOfferAmount] = useState("");
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleOffer = () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) return;
    writeContract({
      address: CONTRACTS.MARKETPLACE.address as `0x${string}`,
      abi: CONTRACTS.MARKETPLACE.abi,
      functionName: "makeOffer",
      args: [CONTRACTS.NFT.address as `0x${string}`, listing.tokenId],
      value: parseEther(offerAmount),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#111] border border-white/10 rounded-[28px] p-8 max-w-sm w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white"><X size={20} /></button>
        <Tag className="text-white/40 mb-4" size={32} />
        <h3 className="text-2xl font-black mb-2">Make an Offer</h3>
        <p className="text-white/40 text-sm mb-6">
          For <strong className="text-white">Card #{listing.tokenId.toString()}</strong> by{" "}
          <strong className="text-white">{listing.cardMeta?.discordUsername || "Unknown"}</strong>.
          Your RITUAL will be escrowed until the seller accepts or you cancel.
        </p>

        <div className="relative mb-6">
          <input
            type="number"
            min="0"
            step="0.001"
            placeholder="0.00"
            value={offerAmount}
            onChange={e => setOfferAmount(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-black text-xl focus:outline-none focus:border-white/30 transition-all"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 font-bold text-sm">RITUAL</span>
        </div>

        {isSuccess ? (
          <div className="text-center py-4">
            <p className="text-green-400 font-black text-lg">✅ Offer Submitted!</p>
            <p className="text-white/40 text-xs mt-1">You can cancel it anytime from the card page.</p>
            <button onClick={onClose} className="mt-4 text-white/50 text-sm hover:text-white">Close</button>
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

// ─── Main Page ──────────────────────────────────────────────────────
export default function MarketplacePage() {
  const { address } = useAccount();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBuy, setSelectedBuy] = useState<Listing | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Listing | null>(null);

  // Read total listing count by reading _listingIds — we approximate by reading from 1..N
  // We'll use a known counter up to 50 and filter active ones
  const MAX_LISTINGS = 50;
  const contracts = Array.from({ length: MAX_LISTINGS }, (_, i) => ({
    address: CONTRACTS.MARKETPLACE.address as `0x${string}`,
    abi: CONTRACTS.MARKETPLACE.abi,
    functionName: "listings",
    args: [BigInt(i + 1)],
  }));

  const { data: rawListings, isLoading: isListingsLoading } = useReadContract({
    // We poll by checking listing ID 1 to find total and use a separate approach
    // Instead we use useReadContracts for batch reading
    address: CONTRACTS.MARKETPLACE.address as `0x${string}`,
    abi: CONTRACTS.MARKETPLACE.abi,
    functionName: "listings",
    args: [BigInt(1)],
  });

  // Better approach: use dynamic fetching via a hook
  const [fetchedListings, setFetchedListings] = useState<Listing[]>([]);

  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      const { createPublicClient, http } = await import("viem");
      const { ritualTestnet } = await import("viem/chains").catch(() => ({ ritualTestnet: null }));

      try {
        const chain = {
          id: 1979,
          name: "Ritual Testnet",
          nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
          rpcUrls: { default: { http: ["https://rpc.ritualfoundation.org"] } },
        };

        const client = createPublicClient({ chain: chain as any, transport: http() });
        const result: Listing[] = [];

        for (let i = 1; i <= MAX_LISTINGS; i++) {
          try {
            const data = await client.readContract({
              address: CONTRACTS.MARKETPLACE.address as `0x${string}`,
              abi: CONTRACTS.MARKETPLACE.abi,
              functionName: "listings",
              args: [BigInt(i)],
            }) as any[];

            if (!data || !data[5]) break; // active is false or data is empty

            const listing: Listing = {
              listingId: BigInt(i),
              nftAddress: data[1],
              tokenId: data[2],
              seller: data[3],
              price: data[4],
              active: data[5],
            };

            if (listing.active) {
              // Fetch card metadata
              try {
                const meta = await client.readContract({
                  address: CONTRACTS.NFT.address as `0x${string}`,
                  abi: CONTRACTS.NFT.abi,
                  functionName: "cardData",
                  args: [listing.tokenId],
                }) as [string, string, string];

                listing.cardMeta = {
                  discordId: meta[0],
                  discordRole: meta[1],
                  discordUsername: meta[2],
                };
              } catch (_) {}

              result.push(listing);
            }
          } catch (_) {
            break; // listing ID doesn't exist, stop
          }
        }

        setFetchedListings(result);
      } catch (e) {
        console.error("Failed to fetch listings", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchListings();
  }, []);

  return (
    <main className="min-h-screen bg-[#080808] text-white font-['Inter',sans-serif]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-6xl font-black uppercase tracking-tighter text-white mb-3">Marketplace</h1>
          <p className="text-white/40 text-lg font-medium">Buy, sell, and make offers on Ritual TCG cards.</p>
          <div className="flex items-center gap-4 mt-4 text-[11px] font-bold text-white/30 uppercase tracking-widest">
            <span>5% Platform Royalty on every sale</span>
            <span>·</span>
            <span>Listing &amp; Offers are gas-only</span>
            <span>·</span>
            <span className="text-white/50 font-mono">{CONTRACTS.MARKETPLACE.address.slice(0, 6)}...{CONTRACTS.MARKETPLACE.address.slice(-4)}</span>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-white/20 mb-4" size={40} />
            <p className="text-white/30 font-bold uppercase tracking-widest text-sm">Fetching Listings...</p>
          </div>
        ) : fetchedListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[40px]">
            <ShoppingCart className="text-white/10 mb-6" size={64} />
            <h3 className="text-2xl font-black text-white/20 mb-2">No Active Listings</h3>
            <p className="text-white/20 text-sm">Mint your card and be the first to list it!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fetchedListings.map((listing) => (
              <ListingCard
                key={listing.listingId.toString()}
                listing={listing}
                onBuy={setSelectedBuy}
                onOffer={setSelectedOffer}
                currentAddress={address}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedBuy && <BuyModal listing={selectedBuy} onClose={() => setSelectedBuy(null)} />}
        {selectedOffer && <OfferModal listing={selectedOffer} onClose={() => setSelectedOffer(null)} />}
      </AnimatePresence>
    </main>
  );
}
