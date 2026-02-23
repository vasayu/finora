"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Database, ArrowRightLeft, Server } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ProblemSolution() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !leftColumnRef.current) return;

    const ctx = gsap.context(() => {
      // Pin the left column while the right column scrolls
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: leftColumnRef.current,
      });

      // Fade up the solution blocks as they scroll into view
      gsap.utils.toArray<HTMLElement>(".solution-block").forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: block,
              start: "top 80%",
              end: "top 20%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const solutions = [
    {
      icon: <Database size={24} className="text-primary" />,
      title: "Fragmented Data Assets",
      desc: "Legacy setups leave valuable operational data siloed across dozens of uncommunicative platforms.",
    },
    {
      icon: <ArrowRightLeft size={24} className="text-accent" />,
      title: "Manual Reconciliation",
      desc: "Analysts spend countless hours matching records instead of extracting actionable business intelligence.",
    },
    {
      icon: <Server size={24} className="text-primary" />,
      title: "The Finora Convergence",
      desc: "Our engine physically binds these streams back together into a single, queryable source of truth.",
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-background transition-colors duration-500 py-24 md:py-0 overflow-visible"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 flex flex-col md:flex-row items-start relative">
        {/* Left Column (Sticky Title) */}
        <div
          ref={leftColumnRef}
          className="w-full md:w-1/2 md:h-screen flex flex-col justify-center pt-12 pb-16 md:py-0"
        >
          <div className="reveal-text mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary">
            <Zap size={16} />
            <span className="uppercase tracking-widest text-xs font-mono font-bold">
              The Convergence
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground mb-6 leading-tight">
            From fragmented chaos <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
              to unified clarity.
            </span>
          </h2>

          <p className="text-xl text-foreground/70 max-w-lg font-medium leading-relaxed">
            Legacy systems force your operations to break apart into disparate
            pieces. Finora&apos;s core architecture seamlessly binds your data
            streams back together.
          </p>
        </div>

        {/* Right Column (Scrolling Solution Blocks) */}
        <div className="w-full md:w-1/2 md:py-[30vh] flex flex-col gap-12 sm:gap-24 relative z-10 sm:pl-10">
          {solutions.map((item, i) => (
            <div
              key={i}
              className="solution-block glass-panel p-8 sm:p-12 rounded-4xl border border-border bg-background/80 shadow-xl transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                {item.title}
              </h3>
              <p className="text-foreground/70 text-lg font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
