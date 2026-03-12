import React from "react";
import Hero from "@/Components/landing/Hero";
import ProblemSolution from "@/Components/landing/ProblemSolution";
import Architecture from "@/Components/landing/Architecture";
import ProductShowcase from "@/Components/landing/ProductShowcase";
import Features from "@/Components/landing/Features";
import CTA from "@/Components/landing/CTA";
import Footer from "@/Components/landing/Footer";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#050505]">
      <Hero />
      <ProblemSolution />
      <Architecture />
      <ProductShowcase />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}
