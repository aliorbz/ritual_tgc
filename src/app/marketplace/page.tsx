"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, createPublicClient, http } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Tag, X, Loader2, AlertTriangle, Package } from "lucide-react";
import { CONTRACTS, ROLE_COLORS } from "@/lib/config";
import { Navbar } from "@/components/Navbar";

// ─── Chain definition (shared) ────────────────────────────────────
const RITUAL_CHAIN = {
  id: 1979,
  name: "Ritual Testnet",
  nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.ritualfoundation.org"] } },
} as const;

function getClient() {
  return createPublicClient({ chain: RITUAL_CHAIN as any, transport: http() });
}

// ─── Types ────────────────────────────────────────────────────────
type CardMeta = { discordId: string; discordRole: string; discordUsername: string };

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

// ─── Color helper ─────────────────────────────────────────────────
function roleColors(role?: string) {
  const roleType = (role || "ritualist").toLowerCase();
  return (ROLE_COLORS as any)[roleType] || ROLE_COLORS.ritualist;
}

// ─── Listed Card ──────────────────────────────────────────────────
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

// ─── Unlisted Card (offer-only) ───────────────────────────────────
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
      className="relative group rounded-[28px] overflow-hidden bg-[#0d0d0d] border border-white/5 hover:border-white/15 transition-all duration-300"
    >
      {/* Card art strip */}
      <div className="h-40 bg-gradient-to-br from-white/3 to-black/40 relative overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(circle at 50% 50%, ${colors.primary}, transparent 70%)` }}
        />
        <div
          className="w-20 h-20 rounded-2xl text-center font-black text-5xl flex items-center justify-center opacity-60"
          style={{ color: colors.primary }}
        >
          #{card.tokenId.toString()}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="font-black text-white text-lg truncate">
          {card.cardMeta?.discordUsername || "Unknown"}
        </p>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: colors.primary }}>
          {card.cardMeta?.discordRole || "Ritualist"}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/20 uppercase font-bold">Not Listed</p>
            <p className="text-white/30 font-black text-sm">No ask price</p>
          </div>
          {isOwner ? (
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest border border-white/10 px-3 py-2 rounded-xl">Yours</span>
          ) : (
            <button
              onClick={() => onOffer(card)}
              className="px-4 py-2 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-xs font-black"
            >
              Make Offer
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Buy Modal ─────────────────────────────────────────────────────
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

// ─── Offer Modal (for both listed and unlisted cards) ──────────────
type OfferTarget = { tokenId: bigint; discordUsername?: string; nftAddress?: string };

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
          For <strong className="text-white">Card #{target.tokenId.toString()}</strong>
          {target.discordUsername ? <> by <strong className="text-white">{target.discordUsername}</strong></> : null}.
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

        {errMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs font-bold text-red-400">{errMsg}</p>
          </div>
        )}

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
  const [unlistedCards, setUnlistedCards] = useState<MintedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBuy, setSelectedBuy] = useState<Listing | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<OfferTarget | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const client = getClient();

      // ── Step 1: Fetch all active listings ────────────────────────
      const MAX_LISTING_SCAN = 200; // scan up to 200 listing IDs
      const activeListings: Listing[] = [];

      for (let i = 1; i <= MAX_LISTING_SCAN; i++) {
        try {
          const data = await client.readContract({
            address: CONTRACTS.MARKETPLACE.address,
            abi: CONTRACTS.MARKETPLACE.abi,
            functionName: "listings",
            args: [BigInt(i)],
          }) as unknown as { listingId: bigint; nftAddress: string; tokenId: bigint; seller: string; price: bigint; active: boolean };

          // If listingId is 0, no listing exists at this ID — stop scanning
          if (!data || data.listingId === BigInt(0)) break;

          // Skip inactive (sold/cancelled) but keep scanning
          if (!data.active) continue;

          const listing: Listing = {
            listingId: data.listingId,
            nftAddress: data.nftAddress,
            tokenId: data.tokenId,
            seller: data.seller,
            price: data.price,
            active: data.active,
          };

          // Fetch card metadata
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
          } catch (_) {}

          activeListings.push(listing);
        } catch (_) {
          // RPC error — stop (listing ID doesn't exist)
          break;
        }
      }

      setListings(activeListings);
      const listedTokenIds = new Set(activeListings.map(l => l.tokenId.toString()));

      // ── Step 2: Fetch all minted cards (totalSupply + tokenByIndex) ──
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

          // Skip if already listed
          if (listedTokenIds.has(tokenId.toString())) continue;

          const owner = await client.readContract({
            address: CONTRACTS.NFT.address,
            abi: CONTRACTS.NFT.abi,
            functionName: "ownerOf",
            args: [tokenId],
          }) as string;

          const card: MintedCard = { tokenId, owner };

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

  const totalMinted = listings.length + unlistedCards.length;

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
            {!isLoading && <span>{totalMinted} card{totalMinted !== 1 ? "s" : ""} minted</span>}
            <span>·</span>
            <span className="text-white/50 font-mono">{CONTRACTS.MARKETPLACE.address.slice(0, 6)}...{CONTRACTS.MARKETPLACE.address.slice(-4)}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-white/20 mb-4" size={40} />
            <p className="text-white/30 font-bold uppercase tracking-widest text-sm">Fetching Cards...</p>
          </div>
        ) : totalMinted === 0 ? (
          // No cards minted at all
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[40px]">
            <Package className="text-white/10 mb-6" size={64} />
            <h3 className="text-2xl font-black text-white/20 mb-2">No Cards Minted Yet</h3>
            <p className="text-white/20 text-sm">Be the first to mint a Ritual TCG card!</p>
          </div>
        ) : (
          <>
            {/* ── Active Listings ────────────────────────────────── */}
            {listings.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-black uppercase tracking-tight">Active Listings</h2>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black text-white/40">
                    {listings.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.listingId.toString()}
                      listing={listing}
                      onBuy={setSelectedBuy}
                      onOffer={(l) => setSelectedOffer({ tokenId: l.tokenId, discordUsername: l.cardMeta?.discordUsername })}
                      currentAddress={address}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Unlisted Cards (make offers) ──────────────────── */}
            {unlistedCards.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-2xl font-black uppercase tracking-tight">All Cards</h2>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black text-white/40">
                    {unlistedCards.length} not listed
                  </span>
                </div>
                <p className="text-white/30 text-sm mb-8">These cards are minted but not listed. Make an offer and the owner can accept it.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {unlistedCards.map((card) => (
                    <UnlistedCard
                      key={card.tokenId.toString()}
                      card={card}
                      onOffer={(c) => setSelectedOffer({ tokenId: c.tokenId, discordUsername: c.cardMeta?.discordUsername })}
                      currentAddress={address}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Edge: listings exist but no unlisted (all minted cards are listed) */}
            {listings.length > 0 && unlistedCards.length === 0 && (
              <div className="mt-8 text-center text-white/20 text-sm font-bold">All minted cards are currently listed.</div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
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
