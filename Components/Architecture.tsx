"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Database, Network, Cpu, Layout } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Architecture() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const layers = gsap.utils.toArray<HTMLElement>(".arch-layer");

    const ctx = gsap.context(() => {
      // Pin the section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: 1,
        },
      });

      // Initially layers are stacked out of view lower down
      gsap.set(layers, {
        y: () => window.innerHeight,
        opacity: 0,
        scale: 0.9,
      });

      // Animate them up one by one in a clean stack
      layers.forEach((layer, i) => {
        tl.to(
          layer,
          {
            y: i * -80, // Stack them up with offset
            opacity: 1,
            scale: 1 - (layers.length - 1 - i) * 0.05,
            duration: 1,
            ease: "power2.out",
          },
          i * 0.8,
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const architecturalLayers = [
    {
      title: "Data Primitives",
      desc: "Raw integrations from external APIs and databases.",
      icon: <Database size={28} className="text-foreground/50" />,
      color: "bg-background border-border",
    },
    {
      title: "Synchronization Mesh",
      desc: "Real-time pub/sub connecting independent systems.",
      icon: <Network size={28} className="text-foreground/70" />,
      color: "bg-background border-primary/20",
    },
    {
      title: "Intelligence Core",
      desc: "Neural processing and algorithmic unification.",
      icon: <Cpu size={28} className="text-primary" />,
      color: "bg-primary/5 border-primary/40",
    },
    {
      title: "Interactive Surface",
      desc: "Spatial UI and intuitive data visualization.",
      icon: <Layout size={28} className="text-accent" />,
      color: "bg-background border-accent shadow-xl",
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-background transition-colors duration-500 overflow-hidden flex items-center justify-center py-20"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* Left text area */}
        <div className="flex-1 text-left z-10 w-full lg:max-w-xl">
          <div className="mb-6 inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-border bg-background shadow-sm text-sm font-semibold text-foreground tracking-wide">
            Enterprise Architecture
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            An architecture <br />
            built for <span className="text-primary">depth.</span>
          </h2>
          <p className="text-xl text-foreground/70 font-medium leading-relaxed max-w-lg relative z-20">
            We don&apos;t just build dashboards. We architect vertical stacks
            that handle chaos at the data layer and present serene clarity at
            the surface.
          </p>
        </div>

        {/* Right visualization area - Clean Stacked layers */}
        <div className="flex-1 relative h-[600px] w-full max-w-lg flex items-center justify-center mt-20 lg:mt-0 lg:mr-10">
          <div className="relative w-full h-[350px]">
            {architecturalLayers.map((layer, i) => (
              <div
                key={layer.title}
                className={`arch-layer absolute top-0 left-0 w-full rounded-4xl p-8 sm:p-10 flex flex-col justify-between shadow-lg border backdrop-blur-md transition-shadow ${layer.color}`}
                style={{
                  zIndex: architecturalLayers.length - i,
                  height: "280px",
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="p-4 rounded-2xl bg-background shadow-sm border border-border flex items-center justify-center">
                    {layer.icon}
                  </div>
                  <span className="font-mono text-sm text-foreground/40 font-bold uppercase tracking-widest bg-foreground/5 px-3 py-1 rounded-full">
                    Layer {i + 1}
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-3xl font-bold text-foreground mb-3">
                    {layer.title}
                  </h3>
                  <p className="text-foreground/60 text-lg font-medium leading-snug">
                    {layer.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
