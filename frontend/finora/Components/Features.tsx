"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BrainCircuit,
  ShieldCheck,
  Zap,
  Workflow,
  RefreshCw,
  Layers,
} from "lucide-react";
import Magnetic from "./Magnetic";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: <BrainCircuit size={32} className="text-white" />,
    title: "Algorithmic Reconciliation",
    desc: "Automatically match millions of transactions across fragmented systems with neural precision.",
  },
  {
    icon: <Workflow size={32} className="text-white" />,
    title: "Zero-Latency Pipes",
    desc: "Direct integration bypassing standard rate limits for real-time financial data availability.",
  },
  {
    icon: <ShieldCheck size={32} className="text-white" />,
    title: "Cryptographic Ledger",
    desc: "Every sync, update, and transformation is immutably logged for enterprise compliance.",
  },
  {
    icon: <RefreshCw size={32} className="text-white" />,
    title: "Infinite Sync Engine",
    desc: "Set and forget. The core constantly harmonizes states without manual triggers.",
  },
  {
    icon: <Zap size={32} className="text-white" />,
    title: "Compute Acceleration",
    desc: "Heavy queries are offloaded to our distributed GPU clusters for instant results.",
  },
  {
    icon: <Layers size={32} className="text-white" />,
    title: "Multi-modal Inputs",
    desc: "Connect unstructured PDFs, legacy databases, and modern REST APIs simultaneously.",
  },
];

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".feature-card",
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 90%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-32 bg-background transition-colors duration-500 overflow-hidden px-6"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-20 text-center sm:text-left">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            The capability of <br className="hidden sm:block" />a{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
              supercomputer.
            </span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl font-medium sm:mx-0 mx-auto">
            Designed to process the most chaotic enterprise financial data and
            return pure, actionable intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Magnetic key={i} strength={5}>
              <div className="feature-card flex flex-col h-full w-full bg-background border border-border hover:border-primary/50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
                {/* Subtle top border highlight on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center mb-8 transform group-hover:-translate-y-1 transition-transform duration-300">
                  {feature.icon}
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-foreground/70 font-medium leading-relaxed flex-1">
                  {feature.desc}
                </p>
              </div>
            </Magnetic>
          ))}
        </div>
      </div>
    </section>
  );
}
