"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Activity, BarChart3, Database, Users, Zap } from "lucide-react";
import Magnetic from "./Magnetic";

export default function ProductShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } =
        containerRef.current.getBoundingClientRect();

      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;

      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const springConfig = { damping: 25, stiffness: 100, mass: 0.5 };

  const rotateX = useSpring(
    useTransform(() => mousePosition.y * -15),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(() => mousePosition.x * 15),
    springConfig,
  );

  // Floating elements parallax
  const floatX1 = useSpring(
    useTransform(() => mousePosition.x * -25),
    springConfig,
  );
  const floatY1 = useSpring(
    useTransform(() => mousePosition.y * -25),
    springConfig,
  );

  const floatX2 = useSpring(
    useTransform(() => mousePosition.x * 40),
    springConfig,
  );
  const floatY2 = useSpring(
    useTransform(() => mousePosition.y * 40),
    springConfig,
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-background transition-colors duration-500 flex flex-col items-center justify-center overflow-hidden py-32 px-6"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center mb-24 relative z-10 max-w-3xl">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
          The <span className="text-primary italic">Intelligence</span> Surface
        </h2>
        <p className="text-xl text-foreground/70 font-medium">
          A dashboard that bends to your reality. Modern rendering ensures every
          interaction feels precise and instantaneous.
        </p>
      </div>

      {/* 3D Dashboard Container */}
      <div className="relative w-full max-w-5xl h-[600px] perspective-[2000px] flex items-center justify-center z-10">
        <motion.div
          style={{ rotateX, rotateY }}
          className="relative w-full h-full bg-background/80 backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 shadow-2xl preserve-3d flex flex-col gap-6"
        >
          {/* Dashboard Header */}
          <div className="flex items-center justify-between border-b border-border pb-6 transform-translate-z-[20px]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner flex items-center justify-center">
                <Zap size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-foreground text-xl font-bold">
                  Neural Engine
                </h3>
                <p className="text-foreground/50 text-sm font-medium">
                  System Status: Optimal
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 transform-translate-z-[40px]">
            {/* Left Column */}
            <div className="col-span-1 flex flex-col gap-6">
              <div className="flex-1 bg-background border border-border rounded-3xl p-6 flex flex-col justify-between hover:border-primary/50 transition-colors shadow-sm">
                <Database size={24} className="text-foreground/40 mb-4" />
                <div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    1.2<span className="text-primary text-xl ml-1">TB</span>
                  </div>
                  <div className="text-xs font-mono text-foreground/50 font-bold uppercase tracking-widest">
                    Data Processed
                  </div>
                </div>
              </div>
              <div className="h-32 bg-primary/10 rounded-3xl p-6 border border-primary/20 flex flex-col justify-between relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent" />
                <Users size={24} className="text-primary relative z-10" />
                <div className="relative z-10 text-foreground font-semibold">
                  Active Nodes
                </div>
              </div>
            </div>

            {/* Main Chart Area */}
            <div className="col-span-1 md:col-span-2 bg-background border border-border rounded-3xl p-6 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-foreground font-semibold">
                  Throughput Topology
                </h4>
                <div className="px-3 py-1 bg-foreground/5 border border-border rounded-full text-xs font-medium text-foreground/70">
                  Real-time
                </div>
              </div>
              <div className="flex-1 flex items-end gap-1.5 sm:gap-2">
                {/* Simulated Chart Bars */}
                {[20, 45, 78, 30, 90, 55, 62, 85, 40, 70, 35, 95].map(
                  (h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: "20%" }}
                      animate={{ height: `${h}%` }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: i * 0.1,
                      }}
                      className="flex-1 bg-linear-to-t from-primary/30 to-primary/80 rounded-t-sm"
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Elements (Outside the dashboard) */}
        <motion.div
          style={{ x: floatX1, y: floatY1 }}
          className="absolute -top-8 -left-4 sm:-top-12 sm:-left-12 p-5 bg-background/90 backdrop-blur-xl border border-border rounded-2xl shadow-xl z-20"
        >
          <Activity size={24} className="text-accent" />
          <div className="mt-3 text-xs font-mono font-bold text-foreground/50 uppercase">
            Sync Rate
          </div>
          <div className="text-xl font-bold text-foreground">99.9%</div>
        </motion.div>

        <motion.div
          style={{ x: floatX2, y: floatY2 }}
          className="absolute -bottom-8 -right-4 sm:-bottom-16 sm:-right-8 p-6 bg-primary shadow-lg shadow-primary/30 border border-primary-foreground/10 rounded-full z-20 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        >
          <Magnetic strength={20}>
            <BarChart3 size={28} className="text-white" />
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
