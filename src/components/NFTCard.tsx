"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { getRoleColors } from "@/lib/utils";

interface NFTCardProps {
  id: string;
  name: string;
  role: string;
  price: string;
  image: string;
  seller: string;
}

export function NFTCard({ id, name, role, price, image, seller }: NFTCardProps) {
  const colors = getRoleColors(role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group transition-all shadow-xl"
      style={{ 
        borderColor: 'rgba(255, 255, 255, 0.1)' 
      }}
      whileHover={{ 
        y: -8,
        borderColor: `${colors.primary}50`,
        boxShadow: `0 20px 40px -15px ${colors.primary}33`
      }}
    >
      <Link href={`/card/${id}`}>
        <div className="relative aspect-[3/4] overflow-hidden glossy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div 
            className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: colors.primary }}
          >
            {role}
          </div>
          
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4"
            style={{ background: `linear-gradient(to top, rgba(0,0,0,0.8), transparent)` }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Eye size={20} />
            </div>
          </div>
        </div>
      </Link>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg mb-1 truncate max-w-[150px]">{name}</h3>
            <p className="text-xs text-white/40 font-mono truncate max-w-[150px]">
              {seller.slice(0, 6)}...{seller.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Price</p>
            <p className="font-outfit font-bold" style={{ color: colors.primary }}>{price} RITUAL</p>
          </div>
        </div>

        <motion.button 
          whileHover={{ backgroundColor: colors.primary, borderColor: colors.primary, color: '#fff' }}
          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} /> Buy Now
        </motion.button>
      </div>
    </motion.div>
  );
}
