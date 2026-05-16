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
  const colors = (ROLE_COLORS as any)[role.type] || ROLE_COLORS.ritualist;
  const isRadiant = role.type === "raiden" || role.type === "radiant";

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div 
        className="absolute inset-0 blur-[60px] rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
        style={{ backgroundColor: colors.glow }}
      />
      
      <div 
        ref={cardRef}
        id="card-capture-area"
        className={`relative w-[360px] h-[520px] rounded-[40px] overflow-hidden bg-[#0a0a0a] border-2 shadow-2xl flex flex-col items-center p-7 glossy`}
        style={{ 
          borderColor: isRadiant ? "#FFD70066" : colors.border.split('-')[1], // Fallback if needed
          borderImage: isRadiant ? "linear-gradient(to bottom, #FFD700, #FDB931) 1" : undefined,
          borderRadius: '40px' // Re-enforce because borderImage can break it
        }}
      >
        {/* Background: User PFP (Blurred & Large) */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={avatar} 
            alt=""
            className="w-full h-full object-cover opacity-25 blur-2xl scale-125 transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[#0a0a0a]" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 w-full h-full flex flex-col items-center">
          {/* Top Section: Avatar (The Main Visual) */}
          <div className="mt-6 relative">
            <div 
              className="absolute inset-0 blur-3xl opacity-50 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <div 
              className={`w-44 h-44 rounded-full border-4 p-1 bg-black/40 backdrop-blur-md relative overflow-hidden group-hover:scale-110 transition-transform duration-700`}
              style={{ borderColor: isRadiant ? "#FFD700" : colors.primary }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={avatar} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Middle Section: Info */}
          <div className="text-center w-full px-4 mt-8">
            <h3 className="text-4xl font-outfit font-black tracking-tight mb-3 truncate text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              {username}
            </h3>
            <div 
              className={`inline-block px-6 py-2 rounded-full border ${colors.text} text-[12px] font-black uppercase tracking-[0.25em] mb-8`}
              style={{ 
                backgroundColor: isRadiant ? "rgba(255, 215, 0, 0.15)" : colors.bg,
                borderColor: isRadiant ? "#FFD70088" : colors.border
              }}
            >
              {role.name}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 w-full px-2 mb-8">
              {[
                { label: "Messages", value: stats?.messages || "---" },
                { label: "Member Since", value: stats?.joins || "---" },
                { label: "Activity", value: stats?.activity || "---" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl py-3 px-1 backdrop-blur-md">
                  <p className="text-[9px] uppercase font-bold text-white/30 tracking-widest mb-1">{stat.label}</p>
                  <p className="text-[11px] font-bold text-white/90">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section: Details */}
          <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex justify-between items-center mt-auto">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Collector</span>
              <span className={`text-[12px] font-mono ${colors.text}`}>
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Not Connected"}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Serial</span>
              <span className="text-[13px] font-outfit font-black text-white/90">
                #{tokenId || "GENESIS"}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        {isRadiant && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[40px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
            <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-yellow-400/50 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
