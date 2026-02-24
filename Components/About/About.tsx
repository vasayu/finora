"use client"

import React from 'react';
import { TrendingUp } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section className="bg-black text-white py-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Empowering the Modern<br />
              <span className="text-orange-500">CFO</span>
            </h2>
            
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Our mission is to bridge the gap between human expertise 
              and intelligent systems. We build CFO-level AI that doesn't just analyze 
              data—it predicts market shifts, automates complex workflows, and 
              empowers financial leaders to focus on what truly matters: strategic 
              decision-making and long-term value creation.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">99.9%</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  AI Decision Accuracy
                </div>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">10x</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Faster Analysis
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button className="bg-transparent border-2 border-orange-500 hover:bg-orange-500 text-orange-500 hover:text-white font-semibold px-8 py-3 rounded-lg transition-all inline-flex items-center gap-2">
              Learn More About Us
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>

          {/* Right Content - Dashboard Mockup */}
          <div className="relative">
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 shadow-2xl">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">Financial Analytics Dashboard</span>
                </div>
              </div>

              {/* Chart Area */}
              <div className="bg-zinc-950 rounded-lg p-4 mb-4">
                {/* Circular Progress */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#27272a"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#f97316"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="351.86"
                        strokeDashoffset="87.96"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">75%</div>
                        <div className="text-xs text-gray-500">Efficiency</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-24 mb-4">
                  <div className="w-full bg-zinc-800 rounded-t" style={{ height: '40%' }}></div>
                  <div className="w-full bg-orange-500 rounded-t" style={{ height: '75%' }}></div>
                  <div className="w-full bg-zinc-800 rounded-t" style={{ height: '60%' }}></div>
                  <div className="w-full bg-orange-500 rounded-t" style={{ height: '85%' }}></div>
                  <div className="w-full bg-zinc-800 rounded-t" style={{ height: '50%' }}></div>
                  <div className="w-full bg-orange-500 rounded-t" style={{ height: '90%' }}></div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-zinc-900 rounded p-2">
                    <div className="text-xs text-gray-500 mb-1">Revenue</div>
                    <div className="text-sm font-semibold text-green-500">+24.5%</div>
                  </div>
                  <div className="bg-zinc-900 rounded p-2">
                    <div className="text-xs text-gray-500 mb-1">Costs</div>
                    <div className="text-sm font-semibold text-red-500">-12.3%</div>
                  </div>
                  <div className="bg-zinc-900 rounded p-2">
                    <div className="text-xs text-gray-500 mb-1">Margin</div>
                    <div className="text-sm font-semibold text-orange-500">18.2%</div>
                  </div>
                </div>
              </div>

              {/* Footer Tabs */}
              <div className="flex gap-2">
                <div className="flex-1 bg-orange-500/10 border border-orange-500/30 rounded px-3 py-2 text-xs text-orange-500 text-center font-medium">
                  Overview
                </div>
                <div className="flex-1 bg-zinc-900 rounded px-3 py-2 text-xs text-gray-500 text-center">
                  Analytics
                </div>
                <div className="flex-1 bg-zinc-900 rounded px-3 py-2 text-xs text-gray-500 text-center">
                  Reports
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-orange-500/10 rounded-2xl blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;