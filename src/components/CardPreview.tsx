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
  children?: React.ReactNode;
}

export function CardPreview({ role, username, avatar, stats, walletAddress, tokenId, children }: CardPreviewProps) {
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

        {/* ── CARD HEADER (Name Only) ── */}
        <div className="relative z-20 w-full text-center bg-black/40 backdrop-blur-sm py-2 px-3 rounded-2xl border border-white/5">
          <h3 
            className="text-base font-black uppercase tracking-wider truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{ color: colors.primary }}
          >
            {username || "Ritualist"}
          </h3>
          {walletAddress && (
            <p className="text-[8px] font-mono font-bold text-white/40 truncate uppercase mt-0.5 tracking-tight">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          )}
        </div>

        {/* ── CARD FOOTER (Action Buttons Only) ── */}
        <div className="relative z-20 w-full">
          {children && (
            <div className="relative z-30 w-full">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
