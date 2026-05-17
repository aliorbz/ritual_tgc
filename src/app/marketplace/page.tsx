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
  ArrowUpDown,
  Trash2,
  Hand
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

// ─── MarketCard Type ────────────────────────────────────────────────
type MarketCard = {
  tokenId: bigint;
  owner: string;
  isListed: boolean;
  listingId?: bigint;
  price?: bigint;
  cardMeta?: CardMeta;
};

// ─── Unified Market Card Component ──────────────────────────────────
function MarketCardItem({ card, onBuy, onOffer, onList, onCancelListing, currentAddress }: {
  card: MarketCard;
  onBuy: (card: MarketCard) => void;
  onOffer: (card: MarketCard) => void;
  onList: (card: MarketCard) => void;
  onCancelListing: (card: MarketCard) => void;
  currentAddress?: string;
}) {
  const colors = roleColors(card.cardMeta?.discordRole);
  const isOwner = currentAddress?.toLowerCase() === card.owner.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group rounded-[32px] overflow-hidden bg-[#0a0a0a]/80 border border-white/5 hover:border-white/20 transition-all duration-500"
      style={{ 
        boxShadow: `0 10px 30px -15px ${colors.glow}`,
        backdropFilter: "blur(12px)"
      }}
    >
      {/* Dynamic Card Display */}
      <Link href={`/card/${card.tokenId}`} className="block p-4">
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
          >
            {/* Custom interactive action buttons directly on card face! */}
            <div className="space-y-1.5 w-full">
              {/* Listed Price Badge directly inside card face */}
              {card.isListed && card.price && (
                <div className="text-center bg-black/70 py-1 rounded-lg border border-white/5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                    {formatEther(card.price)} RITUAL
                  </span>
                </div>
              )}

              {isOwner ? (
                card.isListed ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCancelListing(card);
                    }}
                    className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={12} /> Cancel List
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onList(card);
                    }}
                    className="w-full py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:brightness-110"
                    style={{ 
                      borderColor: colors.primary, 
                      backgroundColor: `${colors.primary}1A`, 
                      color: colors.primary 
                    }}
                  >
                    <Tag size={12} /> List Card
                  </button>
                )
              ) : (
                card.isListed ? (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOffer(card);
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-white/70 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider"
                    >
                      Offer
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onBuy(card);
                      }}
                      className="flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider text-black transition-all hover:brightness-110"
                      style={{ 
                        backgroundColor: colors.primary,
                        boxShadow: `0 4px 12px ${colors.glow}`
                      }}
                    >
                      Buy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOffer(card);
                    }}
                    className="w-full py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:brightness-110"
                    style={{ 
                      borderColor: colors.primary, 
                      backgroundColor: `${colors.primary}1A`, 
                      color: colors.primary 
                    }}
                  >
                    <Hand size={12} /> Make Offer
                  </button>
                )
              )}
            </div>
          </CardPreview>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Buy Modal Component ───────────────────────────────────────────
function BuyModal({ card, onClose, onSuccess }: { card: MarketCard; onClose: () => void; onSuccess?: () => void }) {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && onSuccess) onSuccess();
  }, [isSuccess, onSuccess]);

  const handleBuy = () => {
    if (!card.listingId) return;
    writeContract({
      address: CONTRACTS.MARKETPLACE.address,
      abi: CONTRACTS.MARKETPLACE.abi,
      functionName: "buyItem",
      args: [card.listingId],
      value: card.price || BigInt(0),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#121212] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={20} /></button>
        <ShoppingCart className="text-emerald-400 mb-4" size={32} />
        <h3 className="text-2xl font-black font-outfit mb-2">Confirm Purchase</h3>
        <p className="text-white/50 text-sm mb-6 leading-relaxed">
          You are buying <strong className="text-white">Card #{card.tokenId.toString()}</strong> from{" "}
          <strong className="text-white">@{card.cardMeta?.discordUsername || "Unknown"}</strong>.
        </p>

        <div className="bg-white/5 rounded-2xl p-4 mb-6 flex justify-between items-center border border-white/5 font-mono">
          <span className="text-white/40 text-sm font-bold font-sans">You pay</span>
          <span className="text-white font-black text-xl font-outfit">{formatEther(card.price || BigInt(0))} RITUAL</span>
        </div>

        <div className="text-[10px] text-white/30 font-bold mb-6 flex items-center gap-2 font-sans">
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
            {isPending ? "Waiting in Wallet..." : isConfirming ? "Confirming..." : `Buy for ${formatEther(card.price || BigInt(0))} RITUAL`}
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ─── Offer Modal Component ──────────────────────────────────────────
function OfferModal({ card, onClose, onSuccess }: { card: MarketCard; onClose: () => void; onSuccess?: () => void }) {
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
      args: [CONTRACTS.NFT.address, card.tokenId],
      value: parseEther(offerAmount),
    });
  };

  const errMsg = error ? ((error as any)?.shortMessage || error?.message) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#121212] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={20} /></button>
        <Tag className="text-emerald-400 mb-4" size={32} />
        <h3 className="text-2xl font-black font-outfit mb-2">Make an Offer</h3>
        <p className="text-white/50 text-sm mb-6 leading-relaxed">
          For <strong className="text-white">Card #{card.tokenId.toString()}</strong>
          {card.cardMeta?.discordUsername ? <> owned by <strong className="text-white">@{card.cardMeta.discordUsername}</strong></> : null}.
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
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-black text-xl focus:outline-none focus:border-white/30 transition-all font-outfit font-mono"
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

// ─── List Modal Component ──────────────────────────────────────────
function ListModal({ card, onClose, onSuccess }: { card: MarketCard; onClose: () => void; onSuccess?: () => void }) {
  const [price, setPrice] = useState("");
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && onSuccess) onSuccess();
  }, [isSuccess, onSuccess]);

  const handleList = async () => {
    if (!price || parseFloat(price) <= 0) return;
    try {
      const client = getClient();
      // Check if approved first
      const isApproved = await client.readContract({
        address: CONTRACTS.NFT.address,
        abi: CONTRACTS.NFT.abi,
        functionName: "isApprovedForAll",
        args: [card.owner as `0x${string}`, CONTRACTS.MARKETPLACE.address],
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
          args: [CONTRACTS.NFT.address, card.tokenId, parseEther(price)],
        });
      }
    } catch (e) {
      console.error("Listing failed", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#121212] border border-white/10 rounded-[32px] p-8 max-w-sm w-full relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={20} /></button>
        <Tag className="text-emerald-400 mb-4" size={32} />
        <h3 className="text-2xl font-black font-outfit mb-2">Sell Card</h3>
        <p className="text-white/50 text-sm mb-6 leading-relaxed">
          Set your selling price for <strong className="text-white">Card #{card.tokenId.toString()}</strong>. Listing requires marketplace permission and signature.
        </p>

        <div className="relative mb-6">
          <input
            type="number"
            min="0"
            step="0.001"
            placeholder="0.00"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-black text-xl focus:outline-none focus:border-white/30 transition-all font-outfit font-mono"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 font-bold text-sm font-sans">RITUAL</span>
        </div>

        {isSuccess ? (
          <div className="text-center py-4">
            <p className="text-green-400 font-black text-lg">🎉 Card Listed Successfully!</p>
            <button onClick={onClose} className="mt-4 text-white/50 text-sm hover:text-white font-bold">Close</button>
          </div>
        ) : (
          <button
            onClick={handleList}
            disabled={isPending || isConfirming || !price || parseFloat(price) <= 0}
            className="w-full py-4 rounded-2xl font-black text-lg bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {isPending ? "Waiting in Wallet..." : isConfirming ? "Confirming..." : "Confirm Listing"}
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

  const [selectedBuy, setSelectedBuy] = useState<MarketCard | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<MarketCard | null>(null);
  const [selectedList, setSelectedList] = useState<MarketCard | null>(null);

  // Search & Filter controls
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("recent");

  const roles = ["All", "Mod", "Radiant", "Ritualist", "Ritty", "Bitty"];

  // Delisting write hook
  const { data: cancelHash, writeContract: cancelListingContract, isPending: isCancelPending } = useWriteContract();
  const { isLoading: isCancelConfirming, isSuccess: isCancelConfirmed } = useWaitForTransactionReceipt({ hash: cancelHash });

  const handleCancelListing = (card: MarketCard) => {
    if (!card.listingId) return;
    cancelListingContract({
      address: CONTRACTS.MARKETPLACE.address,
      abi: CONTRACTS.MARKETPLACE.abi,
      functionName: "cancelListing",
      args: [card.listingId],
    });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const client = getClient();

      // ── Step 1: Fetch all minted cards total supply ─────────────────
      let totalSupply = 0;
      try {
        const ts = await client.readContract({
          address: CONTRACTS.NFT.address,
          abi: CONTRACTS.NFT.abi,
          functionName: "totalSupply",
          args: [],
        }) as bigint;
        totalSupply = Number(ts);
      } catch (err) {
        console.error("Failed to read total supply", err);
      }

      // ── Step 2: Fetch owners and activeListings in parallel ────────
      const activeListings: Listing[] = [];
      const unlisted: MintedCard[] = [];

      const tokenPromises = [];
      for (let i = 0; i < totalSupply; i++) {
        tokenPromises.push(
          (async () => {
            try {
              const tokenId = await client.readContract({
                address: CONTRACTS.NFT.address,
                abi: CONTRACTS.NFT.abi,
                functionName: "tokenByIndex",
                args: [BigInt(i)],
              }) as bigint;

              const owner = await client.readContract({
                address: CONTRACTS.NFT.address,
                abi: CONTRACTS.NFT.abi,
                functionName: "ownerOf",
                args: [tokenId],
              }) as string;

              // Query marketplace contract for active listing ID of this token
              const listingId = await client.readContract({
                address: CONTRACTS.MARKETPLACE.address,
                abi: CONTRACTS.MARKETPLACE.abi,
                functionName: "activeListings",
                args: [CONTRACTS.NFT.address, tokenId],
              }) as bigint;

              if (listingId > BigInt(0)) {
                const rawListing = await client.readContract({
                  address: CONTRACTS.MARKETPLACE.address,
                  abi: CONTRACTS.MARKETPLACE.abi,
                  functionName: "listings",
                  args: [listingId],
                }) as any;

                const isArray = Array.isArray(rawListing);
                const seller = isArray ? rawListing[3] : rawListing.seller;
                const price = isArray ? rawListing[4] : rawListing.price;
                const active = isArray ? rawListing[5] : rawListing.active;

                if (active) {
                  activeListings.push({
                    listingId,
                    nftAddress: CONTRACTS.NFT.address,
                    tokenId,
                    seller,
                    price,
                    active,
                  });
                  return;
                }
              }

              // If it has no active listing, it is unlisted
              unlisted.push({ tokenId, owner });
            } catch (err) {
              console.error(`Failed to fetch state for token index ${i}`, err);
            }
          })()
        );
      }

      await Promise.all(tokenPromises);

      // ── Step 3: Fetch metadata for all resolved assets in parallel ─
      const fetchListingMeta = activeListings.map(async (listing) => {
        try {
          const res = await fetch(`/api/metadata/${listing.tokenId}?t=${Date.now()}`);
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
            throw new Error();
          }
        } catch (_) {
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
      });

      const fetchUnlistedMeta = unlisted.map(async (card) => {
        try {
          const res = await fetch(`/api/metadata/${card.tokenId}?t=${Date.now()}`);
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
            throw new Error();
          }
        } catch (_) {
          try {
            const meta = await client.readContract({
              address: CONTRACTS.NFT.address,
              abi: CONTRACTS.NFT.abi,
              functionName: "cardData",
              args: [card.tokenId],
            }) as unknown as { discordId: string; discordRole: string; discordUsername: string };

            card.cardMeta = {
              discordId: Array.isArray(meta) ? (meta as any)[0] : meta.discordId,
              discordRole: Array.isArray(meta) ? (meta as any)[1] : meta.discordRole,
              discordUsername: Array.isArray(meta) ? (meta as any)[2] : meta.discordUsername,
            };
          } catch (_) {}
        }
      });

      await Promise.all([...fetchListingMeta, ...fetchUnlistedMeta]);

      setListings(activeListings);
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

  useEffect(() => {
    if (isCancelConfirmed) {
      fetchData();
    }
  }, [isCancelConfirmed, fetchData]);

  // Combine listings and unlisted cards into a single unified array
  const combinedCards = React.useMemo<MarketCard[]>(() => {
    const list: MarketCard[] = [];

    for (const l of listings) {
      list.push({
        tokenId: l.tokenId,
        owner: l.seller,
        isListed: true,
        listingId: l.listingId,
        price: l.price,
        cardMeta: l.cardMeta,
      });
    }

    for (const u of unlistedCards) {
      list.push({
        tokenId: u.tokenId,
        owner: u.owner,
        isListed: false,
        cardMeta: u.cardMeta,
      });
    }

    return list;
  }, [listings, unlistedCards]);

  // Filter & Sort unified array
  const filteredCards = React.useMemo(() => {
    return combinedCards
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
        if (sort === "price_asc") {
          const pA = a.isListed && a.price !== undefined ? a.price : parseEther("999999");
          const pB = b.isListed && b.price !== undefined ? b.price : parseEther("999999");
          return Number(pA - pB);
        }
        if (sort === "price_desc") {
          const pA = a.isListed && a.price !== undefined ? a.price : BigInt(0);
          const pB = b.isListed && b.price !== undefined ? b.price : BigInt(0);
          return Number(pB - pA);
        }
        // default recent: tokenId desc
        return Number(b.tokenId - a.tokenId);
      });
  }, [combinedCards, search, filter, sort]);

  const totalMinted = combinedCards.length;

  return (
    <main className="min-h-screen bg-[#121212] text-white font-['Outfit',sans-serif]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest mb-3 inline-block uppercase font-sans">
              Ritual TCG Trading Arena
            </span>
            <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white">Marketplace</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-[11px] font-bold text-white/30 uppercase tracking-widest font-sans">
              <span>5% Royalty fee</span>
              <span>·</span>
              <span>Secure Escrow Bids</span>
              <span>·</span>
              {!isLoading && <span>{totalMinted} dynamic card{totalMinted !== 1 ? "s" : ""} minted</span>}
            </div>
          </div>
        </div>

        {/* Dynamic Search and Filter Controls Panel */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-md mb-12">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="relative w-full sm:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, ID, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
              />
            </div>
            
            {/* Role Filter Dropdown */}
            <div className="relative flex items-center bg-black/40 border border-white/5 rounded-2xl px-4 py-3.5 gap-2 font-sans w-full sm:w-auto">
              <SlidersHorizontal size={16} className="text-white/40" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer pr-1 uppercase tracking-wider"
              >
                {roles.map(role => (
                  <option key={role} value={role} className="bg-[#111]">
                    {role === "all" ? "All Roles" : role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-48">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
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
            <div>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tight">TCG Card Arena</h2>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black text-white/40 font-sans">
                  {filteredCards.length} card{filteredCards.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filteredCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredCards.map((card) => (
                    <MarketCardItem
                      key={`${card.isListed ? "listed" : "unlisted"}-${card.tokenId.toString()}`}
                      card={card}
                      onBuy={setSelectedBuy}
                      onOffer={setSelectedOffer}
                      onList={setSelectedList}
                      onCancelListing={handleCancelListing}
                      currentAddress={address}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center rounded-[32px] border border-white/5 bg-white/[0.01] text-white/30 text-sm font-bold">
                  No cards match your current filters.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delisting Loader Overlay */}
      {isCancelConfirming && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md">
          <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
          <p className="text-white/60 font-bold uppercase tracking-widest text-xs font-sans">Cancelling On-chain Listing...</p>
        </div>
      )}

      {/* Dynamic Modals */}
      <AnimatePresence>
        {selectedBuy && (
          <BuyModal
            card={selectedBuy}
            onClose={() => setSelectedBuy(null)}
            onSuccess={() => { setSelectedBuy(null); fetchData(); }}
          />
        )}
        {selectedOffer && (
          <OfferModal
            card={selectedOffer}
            onClose={() => setSelectedOffer(null)}
            onSuccess={() => { setSelectedOffer(null); }}
          />
        )}
        {selectedList && (
          <ListModal
            card={selectedList}
            onClose={() => setSelectedList(null)}
            onSuccess={() => { setSelectedList(null); fetchData(); }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
