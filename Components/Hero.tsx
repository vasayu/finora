"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ArrowRight, Activity, Cpu, Network } from "lucide-react";
import HeroBackground from "./HeroBackground";
import Magnetic from "./Magnetic";
import Link from "next/link";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    // Elegant, slow fade up for cards
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".glass-card",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.5,
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-background transition-colors duration-500"
    >
      {/* 3D Background */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <HeroBackground />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-12 pt-32 pb-20 flex flex-col xl:flex-row items-center gap-16">
        {/* Left Column: Copy */}
        <div className="flex-1 flex flex-col items-start w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-3 mb-8 px-4 py-2 rounded-full glass-panel border-primary/30 text-primary bg-background/50 shadow-sm"
          >
            <Activity size={16} className="animate-pulse" />
            <span className="font-mono text-xs font-medium tracking-widest uppercase">
              System Unified
            </span>
          </motion.div>

          <div className="max-w-3xl w-full">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[80px] leading-tight font-bold tracking-tighter text-foreground"
            >
              Financial intelligence,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                unified at the core.
              </span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="max-w-xl mt-8 mb-12 text-lg sm:text-xl text-foreground/60 font-medium leading-relaxed"
          >
            Your data no longer lives in silos. The intelligence engine connects
            spreadsheets to APIs, eliminating the void and unlocking real-time
            operational truth.
          </motion.p>

          <Magnetic strength={10}>
            <Link href="/register">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                className="group flex items-center gap-4 px-8 py-4 bg-background/80 hover:bg-background backdrop-blur-md border border-border shadow-lg shadow-black/5 hover:shadow-primary/20 rounded-2xl text-foreground font-semibold transition-all relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-lg">Initialize Core</span>
                <div className="relative z-10 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </motion.div>
            </Link>
          </Magnetic>
        </div>

        {/* Right Column: Clean Dashboard Peek */}
        <div className="flex-1 w-full max-w-[600px] grid grid-cols-2 gap-4 sm:gap-6 relative mt-12 xl:mt-0">
          {/* Subtle glow behind cards */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Card 1 */}
          <div className="glass-card glass-panel p-6 sm:p-8 rounded-3xl flex flex-col gap-6 col-span-2 relative overflow-hidden border border-border/50 bg-background/60 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                  <Cpu size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-lg">
                    Neural Processing
                  </h3>
                  <p className="text-foreground/50 text-sm">
                    Active Synchronization
                  </p>
                </div>
              </div>
              <span className="text-primary font-mono font-medium bg-primary/10 px-3 py-1 rounded-full">
                99.9%
              </span>
            </div>
            {/* Minimal Graph */}
            <div className="h-20 w-full mt-2 flex items-end gap-1.5 sm:gap-2">
              {[40, 70, 45, 90, 65, 80, 50, 100, 70, 85].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary/20 to-primary/80 rounded-t-md opacity-80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card glass-panel p-6 sm:p-8 rounded-3xl flex flex-col justify-between border border-border/50 bg-background/60 shadow-lg relative overflow-hidden">
            <Network size={28} className="text-primary/60 mb-6" />
            <div>
              <p className="text-4xl font-bold text-foreground mb-2">
                2.4
                <span className="text-xl text-primary font-medium ml-1">
                  ms
                </span>
              </p>
              <p className="text-xs text-foreground/50 uppercase tracking-wider font-mono font-medium">
                Query Latency
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card glass-panel p-6 sm:p-8 rounded-3xl flex flex-col justify-between border border-border/50 bg-background/60 shadow-lg relative overflow-hidden">
            <Activity size={28} className="text-primary/60 mb-6" />
            <div>
              <p className="text-4xl font-bold text-foreground mb-2">Zero</p>
              <p className="text-xs text-foreground/50 uppercase tracking-wider font-mono font-medium">
                Data Silos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
