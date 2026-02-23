"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Box, Twitter, Linkedin, Github } from "lucide-react";
import Magnetic from "./Magnetic";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".footer-el", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-background transition-colors duration-500 pt-32 pb-12 border-t border-border overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-primary/10 blur-[150px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col bg-background/50 backdrop-blur-xl rounded-4xl border border-border p-12 lg:p-20 shadow-xl mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 footer-el">
            <Link href="/" className="flex items-center gap-2 group mb-6 w-max">
              <Magnetic strength={20}>
                <div className="text-primary group-hover:scale-110 transition-transform">
                  <Box size={32} />
                </div>
              </Magnetic>
              <span className="text-2xl font-bold tracking-tight text-foreground drop-shadow-sm">
                Finora
              </span>
            </Link>
            <p className="text-foreground/60 text-sm max-w-xs leading-relaxed mb-8 font-medium">
              The intelligence core for enterprise finance. Unifying fragmented
              data into a single source of mathematical truth.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <Magnetic key={i} strength={15}>
                  <Link
                    href="#"
                    className="w-10 h-10 rounded-full bg-foreground/5 border border-border flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-all shadow-sm"
                  >
                    <Icon size={18} />
                  </Link>
                </Magnetic>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="footer-el">
            <h4 className="text-foreground font-bold mb-6 uppercase tracking-widest text-xs">
              Platform
            </h4>
            <ul className="flex flex-col gap-4">
              {[
                "Intelligence Core",
                "Data Primitives",
                "Neural Sync",
                "Security & Compliance",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-foreground/60 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-el">
            <h4 className="text-foreground font-bold mb-6 uppercase tracking-widest text-xs">
              Solutions
            </h4>
            <ul className="flex flex-col gap-4">
              {[
                "Enterprise Finance",
                "Algorithmic Trading",
                "Reconciliation",
                "Private Equity",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-foreground/60 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-el">
            <h4 className="text-foreground font-bold mb-6 uppercase tracking-widest text-xs">
              Company
            </h4>
            <ul className="flex flex-col gap-4">
              {["About Finora", "Research", "Careers", "Contact"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-foreground/60 hover:text-primary transition-colors text-sm font-medium"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        {/* Big Text Bottom */}
        <div className="w-full border-t border-border pt-12 flex flex-col md:flex-row items-center justify-between gap-6 footer-el">
          <p className="text-foreground/40 font-medium text-xs">
            © {new Date().getFullYear()} Finora Mathematical Systems, Inc. All
            rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-foreground/40 font-medium">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Status Logs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
