"use client";

import React from "react";
import { Check } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Startup",
      price: "$29",
      period: "/month",
      description: "Perfect for small teams and early-stage startups.",
      features: [
        "Up to 5 team members",
        "Basic analytics",
        "24/7 support",
        "10GB storage",
      ],
      buttonText: "Get Started",
      highlighted: false,
    },
    {
      name: "Growth",
      price: "$99",
      period: "/month",
      description: "Ideal for growing businesses that need more power.",
      features: [
        "Up to 20 team members",
        "Advanced analytics",
        "Priority support",
        "100GB storage",
        "Custom integrations",
      ],
      buttonText: "Upgrade to Growth",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$299",
      period: "/month",
      description: "For large organizations with complex needs.",
      features: [
        "Unlimited team members",
        "Custom reporting",
        "Dedicated account manager",
        "Unlimited storage",
        "Advanced security",
        "SSO integration",
      ],
      buttonText: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-32 pb-24">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/15 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 pricing-header">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Choose the perfect plan for your business. No hidden fees, cancel
            anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-center">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative group rounded-3xl transition-all duration-300 ${
                plan.highlighted ? "md:-mt-8 md:mb-8 z-10" : "z-0"
              }`}
            >
              {/* Animated Border Gradient for Highlighted Plan */}
              {plan.highlighted && (
                <div className="absolute -inset-[1px] bg-gradient-to-b from-primary via-accent to-secondary rounded-3xl opacity-50 blur-[2px]" />
              )}

              <div
                className={`relative h-full glass-panel glass-reflection p-8 rounded-3xl flex flex-col ${
                  plan.highlighted
                    ? "bg-glass-bg border-primary/50 shadow-primary/20 shadow-2xl"
                    : "border-glass-border hover:border-white/20"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-foreground/60 h-10">{plan.description}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-foreground/60">{plan.period}</span>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center text-foreground/80"
                    >
                      <Check className="w-5 h-5 text-primary mr-3 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform group-hover:scale-[1.02] ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 hover:shadow-primary/50"
                      : "bg-white/10 hover:bg-white/20 text-foreground"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
