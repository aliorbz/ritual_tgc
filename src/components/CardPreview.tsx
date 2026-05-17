"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ROLE_COLORS } from "@/lib/config";

interface CardPreviewProps {
  role: { type: string, name: string };
  username: string;
  avatar: string;
  stats?: { messages: string, joins: string, activity: string };
  walletAddress?: string;
  tokenId?: string;
}

export function CardPreview({ role, username, avatar, stats, walletAddress, tokenId }: CardPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const roleType = (role?.type || "ritualist").toLowerCase();
  const colors = (ROLE_COLORS as any)[roleType] || ROLE_COLORS.ritualist;
  const isRadiant = roleType === "raiden" || roleType === "radiant";

  // Normalize stats to handle both Discord API and DB keys
  const messages = stats?.messages || (stats as any)?.messageCount || "0";
  const level = stats?.level || "1";
  const activity = stats?.activity || (stats as any)?.activity || "New";

  return (
    <div className="relative group select-none">
      {/* Dynamic Glow Aura */}
      <div 
        className="absolute -inset-1 blur-[35px] rounded-[36px] opacity-20 group-hover:opacity-75 transition-all duration-700" 
        style={{ 
          background: `linear-gradient(to bottom, ${colors.primary}, ${colors.secondary || colors.primary})`
        }}
      />
      
      <div 
        ref={cardRef}
        id="card-capture-area"
        className="relative w-[280px] h-[390px] rounded-[32px] overflow-hidden bg-[#050505] border-2 shadow-2xl flex flex-col justify-between p-4 transition-transform duration-500 hover:scale-[1.02] border-white/10"
        style={{ 
          boxShadow: `0 20px 40px -15px ${colors.glow}`,
          borderColor: isRadiant ? "#FFD700" : colors.primary
        }}
      >
        {/* Background Card Art (PFP) */}
        <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={avatar} 
              alt="Avatar"
              className="w-full h-full object-cover opacity-80 brightness-[0.85] transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
              <span className="text-white/20 text-xs font-mono">No Image</span>
            </div>
          )}
          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </div>

        {/* Dynamic Card Shimmer effect */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.08)_60%,transparent_70%)] bg-[length:200%_100%] animate-[shimmer_2.5s_infinite_linear]" />

        {/* ── CARD HEADER ── */}
        <div className="relative z-20 flex items-center justify-between w-full">
          {/* Token ID Badge */}
          <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <span className="text-[10px] font-mono font-black text-white/70">
              #{tokenId ? tokenId : "PREVIEW"}
            </span>
          </div>

          {/* Rarity/Role Badge */}
          <div 
            className="px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md"
            style={{ 
              borderColor: colors.primary,
              color: colors.primary,
              boxShadow: `0 0 10px ${colors.glow}`
            }}
          >
            {role?.name || "Ritualist"}
          </div>
        </div>

        {/* ── CARD FOOTER ── */}
        <div className="relative z-20 w-full flex flex-col gap-2.5">
          {/* User Name Tag */}
          <div className="w-full text-center">
            <h3 
              className="text-lg font-black uppercase tracking-tighter truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{ color: colors.primary }}
            >
              {username || "Ritualist"}
            </h3>
            {walletAddress && (
              <p className="text-[9px] font-mono font-bold text-white/30 truncate uppercase mt-0.5">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            )}
          </div>

          {/* Player Stats Dashboard */}
          <div className="grid grid-cols-3 gap-1 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-2 text-center">
            <div>
              <p className="text-[8px] font-black text-white/40 uppercase tracking-wider">MSG</p>
              <p className="text-xs font-bold text-white mt-0.5 font-mono">{messages}</p>
            </div>
            <div className="border-x border-white/5">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-wider">LVL</p>
              <p className="text-xs font-bold text-white mt-0.5 font-mono">{level}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-white/40 uppercase tracking-wider">ACTIVE</p>
              <p className="text-xs font-bold text-white mt-0.5 font-mono truncate">{activity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
