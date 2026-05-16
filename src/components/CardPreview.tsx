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
        className={`relative w-[280px] h-[380px] rounded-[32px] overflow-hidden bg-[#0a0a0a] border-4 shadow-2xl flex flex-col items-center justify-center glossy`}
        style={{ 
          borderColor: isRadiant ? "#FFD700" : colors.primary,
          borderImage: isRadiant ? "linear-gradient(to bottom, #FFD700, #FDB931) 1" : undefined,
          borderRadius: '32px'
        }}
      >
        {/* Background: User PFP filling the whole card */}
        <div className="absolute inset-0 z-0 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={avatar} 
            alt="Avatar"
            className="w-full h-full object-cover"
          />
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
