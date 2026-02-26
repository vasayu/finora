"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Box, Menu, X, LayoutDashboard, User } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnetic from "./Magnetic";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(containerRef.current, {
        scrollTrigger: {
          trigger: "body",
          start: "top -50",
          end: "top -100",
          scrub: 1,
        },
        width: "90%",
        borderRadius: "40px",
        padding: "0.5rem 1.5rem",
        backgroundColor: "var(--glass-bg)",
        borderColor: "var(--glass-border)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 transition-all duration-300">
      <div
        ref={containerRef}
        className="w-[98%] sm:w-[95%] xl:max-w-[1400px] bg-background/60 backdrop-blur-xl rounded-2xl flex justify-between items-center px-6 py-4 mx-2 transition-all duration-300 border border-border"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Magnetic strength={30}>
            <div className="text-primary group-hover:scale-110 transition-transform">
              <Box size={24} />
            </div>
          </Magnetic>
          <span className="text-xl font-bold tracking-tight text-foreground drop-shadow-sm">
            Finora
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Platform", "Solutions", "Resources", "Pricing"].map((item) => (
            <Magnetic key={item} strength={15}>
              <Link
                href="#"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-right hover:after:origin-left"
              >
                {item}
              </Link>
            </Magnetic>
          ))}
        </div>

        {/* Auth & Theme (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <>
              <Magnetic strength={15}>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-3 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-primary/30"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              </Magnetic>
              <Magnetic strength={15}>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-[10px] font-bold">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </div>
                </Link>
              </Magnetic>
            </>
          ) : (
            <>
              <Magnetic strength={15}>
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-2"
                >
                  Log In
                </Link>
              </Magnetic>
              <Magnetic strength={30}>
                <Link
                  href="/register"
                  className="relative overflow-hidden text-sm font-semibold bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-full transition-colors group shadow-lg shadow-primary/20 hover:shadow-primary/40"
                >
                  <span className="relative z-10">Get Started</span>
                </Link>
              </Magnetic>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <button
            className="text-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-[110%] left-0 w-full px-4 md:hidden">
          <div className="bg-background border border-border rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            {["Platform", "Solutions", "Resources", "Pricing"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors border-b border-border pb-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-center text-lg font-semibold bg-primary text-white rounded-xl py-3 shadow-lg shadow-primary/20 inline-flex items-center justify-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="text-center text-lg font-medium text-foreground/80 hover:text-primary transition-colors w-full border border-border rounded-xl py-3 inline-flex items-center justify-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-center text-lg font-medium text-foreground/80 hover:text-primary transition-colors w-full border border-border rounded-xl py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="text-center text-lg font-semibold bg-primary text-white rounded-xl py-3 shadow-lg shadow-primary/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
