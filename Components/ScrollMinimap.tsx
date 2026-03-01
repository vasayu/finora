"use client";

import React, { useEffect, useState, useRef } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import { motion, useScroll, useSpring } from "framer-motion";

// Configuration for the minimap segments corresponding to sections
const SECTIONS = [
  { id: "hero", label: "01" },
  { id: "problem-solution", label: "02" },
  { id: "architecture", label: "03" },
  { id: "features", label: "04" },
];

export default function ScrollMinimap() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const lenis = useLenis();
  const { scrollYProgress } = useScroll();

  // Smooth scroll progress specifically for the active bar
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Track active section using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -79% 0px", // Trigger when section hits top 20% of viewport
      },
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Determine visibility based on content height
  useEffect(() => {
    const handleResize = () => {
      const bodyHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      );
      // Only show if page is significantly taller than viewport
      setIsVisible(bodyHeight > window.innerHeight * 1.5);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Check DOM mutations in case content loads dynamically
    const observer = new MutationObserver(handleResize);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  // Handle smooth scrolling to target natively via Lenis
  const handleScrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Use Lenis if available
    if (lenis) {
      lenis.scrollTo(`#${id}`, { offset: 0, duration: 1.5 });
    } else {
      // Fallback
      document.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 h-[65vh] w-6 flex justify-center opacity-0 animate-fade-in group hidden xl:flex">
      {/* Invisible wider interaction area to make hovering easier */}
      <div className="absolute inset-y-0 -inset-x-8 cursor-pointer z-0" />

      {/* Container glass track */}
      <div className="relative w-1.5 bg-[rgba(15,23,42,0.15)] dark:bg-white/10 rounded-full overflow-hidden backdrop-blur-md transition-all duration-300 group-hover:w-2 group-hover:bg-white/15 h-full flex flex-col items-center z-10">
        {/* Animated gradient progress fill running behind segments */}
        <motion.div
          className="absolute top-0 w-full bg-gradient-to-b from-primary via-accent to-secondary origin-top rounded-full z-0 opacity-50 group-hover:opacity-80"
          style={{
            scaleY,
            height: "100%",
          }}
        />

        {/* Individual Segments */}
        <div className="relative z-10 flex flex-col justify-between w-full h-full py-[2px]">
          {SECTIONS.map((section, idx) => {
            const isActive = activeSection === section.id;
            const isHovered = hoveredSection === section.id;

            return (
              <div
                key={section.id}
                className="w-full flex-1 flex flex-col justify-center items-center group/segment cursor-pointer"
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
                onClick={(e) => handleScrollTo(section.id, e)}
              >
                {/* Segment indicator dot/line */}
                <div
                  className={`transition-all duration-300 rounded-full ${
                    isActive
                      ? "h-4 w-full bg-[#F97316] shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                      : isHovered
                        ? "h-2 w-full bg-[#F97316]/70"
                        : "h-1 w-1/2 bg-white/40"
                  }`}
                />

                {/* Hover label (pops out to the left) */}
                <span
                  className={`absolute right-10 whitespace-nowrap text-xs font-mono font-bold tracking-widest px-2 py-1 rounded-md bg-background/90 text-primary border border-primary/20 backdrop-blur-md shadow-lg transition-all duration-300 origin-right ${
                    isHovered
                      ? "opacity-100 translate-x-0 scale-100"
                      : "opacity-0 translate-x-2 scale-95 pointer-events-none"
                  }`}
                >
                  {section.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
