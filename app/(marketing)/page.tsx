import React from "react";
import Hero from "@/Components/Hero";
import ProblemSolution from "@/Components/ProblemSolution";
import Architecture from "@/Components/Architecture";
import ProductShowcase from "@/Components/ProductShowcase";
import Features from "@/Components/Features";
import CTA from "@/Components/CTA";
import Footer from "@/Components/Footer";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen overflow-hidden bg-[#050505]">
      <Hero />
      <ProblemSolution />
      <Architecture />
      <ProductShowcase />
      <Features />
      <CTA />
      {/* <Footer /> */}
    </main>
  );
}
