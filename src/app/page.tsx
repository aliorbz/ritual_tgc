"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Zap, 
  Shield, 
  ArrowRight, 
  Layers, 
  Flame 
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#060606] text-white overflow-hidden font-['Outfit',sans-serif] relative">
      <Navbar />

      {/* Infinite Video Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          className="w-full h-full object-cover opacity-40 filter blur-[4px]"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/media/ritualvid.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay with gradients to integrate the video smoothly */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060606]/50 to-[#060606]/95" />
      </div>

      {/* Hero Section */}
      <section className="relative w-full pt-36 md:pt-48 lg:pt-36 pb-24 lg:pb-32 flex items-center justify-center z-10">
        {/* Background Glowing Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-600/10 blur-[150px] rounded-full pointer-events-none z-0" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tighter uppercase">
              Collect Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-purple-400 to-purple-500 drop-shadow-[0_2px_20px_rgba(16,185,129,0.3)]">
                Ritual TCG
              </span>
            </h1>
            
            <p className="text-white/50 text-base md:text-xl max-w-xl mb-10 leading-relaxed font-sans font-medium">
              The first Discord-native TCG collection on Ritual Testnet
            </p>

            <div className="flex items-center justify-center w-full">
              <Link 
                href="/marketplace"
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-white text-black font-black text-lg flex items-center justify-center gap-3 transition-all hover:brightness-95 shadow-xl hover:shadow-white/5"
              >
                Enter Marketplace <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="container mx-auto px-6 py-20 border-t border-white/5 relative z-10 bg-white/[0.01]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {[
            {
              icon: <Layers className="text-emerald-400" size={26} />,
              title: "Discord-Native Traits",
              description: "Your card type and attributes are direct mirrors of your Ritual Discord server role, message activity, and days in server."
            },
            {
              icon: <Shield className="text-blue-400" size={26} />,
              title: "Transparent 5% Royalty",
              description: "Secured by robust smart contracts. Only a small 5% platform royalty is taken on successful marketplace sales, maximizing profit for creators."
            },
            {
              icon: <Flame className="text-yellow-400" size={26} />,
              title: "One Click Sync",
              description: "Minted a card as a Bitty? Unlock next-tier capabilities just by one click syncing as you climb roles to Ritty, Ritualist, or Radiant!"
            }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-8 rounded-[32px] bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col gap-5 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{feat.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-sans">{feat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Showcase Section (Featured Users Scrolling Tickers) */}
      <section className="py-24 relative z-10 w-full overflow-hidden border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-6 max-w-6xl mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest mb-3 inline-block uppercase font-sans">
                Dynamic Active Collectors
              </span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Featured Users</h2>
              <p className="text-white/40 text-sm mt-2 font-sans max-w-lg">
                Dynamic server participants and collection collectors climbing the ranks in real-time.
              </p>
            </div>
            <Link 
              href="/marketplace" 
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold text-sm tracking-wider uppercase transition-all font-sans"
            >
              Enter Arena <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Scrolling Tickers Wrapper */}
        <div className="space-y-8 w-full select-none pointer-events-auto">
          
          {/* Row 1: Left to Right */}
          <div className="relative flex flex-row flex-nowrap overflow-x-hidden w-full mask-gradient">
            <div className="animate-marquee-right flex flex-row flex-nowrap gap-6 px-3">
              {[
                "03e4e0d39ad4be7c979df0203e1353e7.webp",
                "0a92e23a280629e2b44ca48a931515da.webp",
                "0fa37a8a29d958a9f42386eadaac3d7c.webp",
                "310c7bea13fe6d427785457dee751057.webp",
                "31617ac03e7c98f4cb98d3a814ef438a.webp",
                "3df123bf9b7c3b7aef0959c1455bbb05.webp",
                "43e0a6d1ef4fccd4f075ff7454e6282d.webp",
                "4d36fbe585cbdd26d34e1219cba16a81.webp",
                "51c8191614655b21f1b01deca7bfe97c.webp",
                "603d519ca49971f22e8e9f6e2077c9d7.webp"
              ].map((img, i) => (
                <img 
                  key={`r1-${i}`} 
                  src={`/listimg/${img}`} 
                  alt="User Avatar" 
                  className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-[24px] flex-shrink-0" 
                />
              ))}
            </div>
            <div className="animate-marquee-right flex flex-row flex-nowrap gap-6 px-3" aria-hidden="true">
              {[
                "03e4e0d39ad4be7c979df0203e1353e7.webp",
                "0a92e23a280629e2b44ca48a931515da.webp",
                "0fa37a8a29d958a9f42386eadaac3d7c.webp",
                "310c7bea13fe6d427785457dee751057.webp",
                "31617ac03e7c98f4cb98d3a814ef438a.webp",
                "3df123bf9b7c3b7aef0959c1455bbb05.webp",
                "43e0a6d1ef4fccd4f075ff7454e6282d.webp",
                "4d36fbe585cbdd26d34e1219cba16a81.webp",
                "51c8191614655b21f1b01deca7bfe97c.webp",
                "603d519ca49971f22e8e9f6e2077c9d7.webp"
              ].map((img, i) => (
                <img 
                  key={`r1-dup-${i}`} 
                  src={`/listimg/${img}`} 
                  alt="User Avatar" 
                  className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-[24px] flex-shrink-0" 
                />
              ))}
            </div>
          </div>

          {/* Row 2: Right to Left */}
          <div className="relative flex flex-row flex-nowrap overflow-x-hidden w-full mask-gradient">
            <div className="animate-marquee-left flex flex-row flex-nowrap gap-6 px-3">
              {[
                "6262d48ae6e296a5a6e210f03185d2e2.webp",
                "6559259dd85e77f0b66464113b91eae0.webp",
                "760a6408b6097db26632c9a258fb61c4.webp",
                "794a932f2532c7425f196748481f050e.webp",
                "7a87c165bdb22f63d3845fecc803bd7a.webp",
                "7e2c71557364de8bcc8171c704f056e3.webp",
                "808c490a63b2b60bb37e5d48a2948288.webp",
                "821ec6165f928b2e88cc51acf4639be4.webp",
                "8700fbd611af5055c8325dc2fcd31fcf.webp",
                "96e0ee90f489fa71a22817906f95cb43.webp"
              ].map((img, i) => (
                <img 
                  key={`r2-${i}`} 
                  src={`/listimg/${img}`} 
                  alt="User Avatar" 
                  className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-[24px] flex-shrink-0" 
                />
              ))}
            </div>
            <div className="animate-marquee-left flex flex-row flex-nowrap gap-6 px-3" aria-hidden="true">
              {[
                "6262d48ae6e296a5a6e210f03185d2e2.webp",
                "6559259dd85e77f0b66464113b91eae0.webp",
                "760a6408b6097db26632c9a258fb61c4.webp",
                "794a932f2532c7425f196748481f050e.webp",
                "7a87c165bdb22f63d3845fecc803bd7a.webp",
                "7e2c71557364de8bcc8171c704f056e3.webp",
                "808c490a63b2b60bb37e5d48a2948288.webp",
                "821ec6165f928b2e88cc51acf4639be4.webp",
                "8700fbd611af5055c8325dc2fcd31fcf.webp",
                "96e0ee90f489fa71a22817906f95cb43.webp"
              ].map((img, i) => (
                <img 
                  key={`r2-dup-${i}`} 
                  src={`/listimg/${img}`} 
                  alt="User Avatar" 
                  className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-[24px] flex-shrink-0" 
                />
              ))}
            </div>
          </div>

          {/* Row 3: Left to Right */}
          <div className="relative flex flex-row flex-nowrap overflow-x-hidden w-full mask-gradient">
            <div className="animate-marquee-right flex flex-row flex-nowrap gap-6 px-3">
              {[
                "994c8ad7a94929c366ebf05cf7442692.webp",
                "a_b4d8119d7f3d52cb9ec256a613674880.gif",
                "bc28a9ea56b0d4b42413c8befaa2a863.webp",
                "d335f04ae7d658be3391ee772e19665e.webp",
                "d42ad307bd918b95744f2593d8cb7a5e.webp",
                "d8e453da6a5d2ad7c6a4dfbfdcded733.webp",
                "de2a3e5ed2df5c5fb63ec4042610c0ff.webp",
                "e43c3792b138c28317a2d2708f022733.webp",
                "e613113b257ebae1d442daf159ac6e45.webp",
                "ecf863e6cc9a8a1b2c130bf9658c5324.webp"
              ].map((img, i) => (
                <img 
                  key={`r3-${i}`} 
                  src={`/listimg/${img}`} 
                  alt="User Avatar" 
                  className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-[24px] flex-shrink-0" 
                />
              ))}
            </div>
            <div className="animate-marquee-right flex flex-row flex-nowrap gap-6 px-3" aria-hidden="true">
              {[
                "994c8ad7a94929c366ebf05cf7442692.webp",
                "a_b4d8119d7f3d52cb9ec256a613674880.gif",
                "bc28a9ea56b0d4b42413c8befaa2a863.webp",
                "d335f04ae7d658be3391ee772e19665e.webp",
                "d42ad307bd918b95744f2593d8cb7a5e.webp",
                "d8e453da6a5d2ad7c6a4dfbfdcded733.webp",
                "de2a3e5ed2df5c5fb63ec4042610c0ff.webp",
                "e43c3792b138c28317a2d2708f022733.webp",
                "e613113b257ebae1d442daf159ac6e45.webp",
                "ecf863e6cc9a8a1b2c130bf9658c5324.webp"
              ].map((img, i) => (
                <img 
                  key={`r3-dup-${i}`} 
                  src={`/listimg/${img}`} 
                  alt="User Avatar" 
                  className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-[24px] flex-shrink-0" 
                />
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
