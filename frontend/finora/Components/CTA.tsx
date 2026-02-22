"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Sparkles } from "lucide-react";
import Magnetic from "./Magnetic";

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal lines
      gsap.from(".cta-line", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
        y: 100,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: "power4.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[80vh] min-h-[600px] bg-background transition-colors duration-500 overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12"
    >
      {/* Background Graphic */}
      <motion.div
        style={{ scale, opacity }}
        className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
      >
        <div className="w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_50%)] opacity-10 dark:opacity-20 blur-[100px]" />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-5xl glass-panel bg-background/50 border border-border backdrop-blur-2xl rounded-4xl p-12 sm:p-24 shadow-2xl flex flex-col items-center text-center">
        <div className="overflow-hidden mb-4 sm:mb-6">
          <h2 className="cta-line text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-foreground leading-tight sm:leading-none">
            Ready to unify
          </h2>
        </div>
        <div className="overflow-hidden mb-8 sm:mb-12">
          <h2 className="cta-line text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-foreground leading-tight sm:leading-none">
            your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent italic pr-2">
              intelligence?
            </span>
          </h2>
        </div>

        <div className="overflow-hidden mb-12 sm:mb-16">
          <p className="cta-line text-lg sm:text-2xl text-foreground/70 font-medium max-w-2xl mx-auto leading-relaxed">
            Join the elite organizations powering their decisions with pure,
            unfragmented data.
          </p>
        </div>

        <div className="cta-line">
          <Magnetic strength={30}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="group relative flex items-center justify-center gap-4 px-10 sm:px-12 py-5 sm:py-6 bg-primary rounded-full text-white font-bold text-lg sm:text-xl overflow-hidden shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles size={24} className="group-hover:animate-pulse" />
                Initialize Instance
              </span>

              {/* Swipe Physics Effect */}
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />

              <div className="relative z-10 w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shadow-sm ml-2 sm:ml-4">
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </motion.button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
