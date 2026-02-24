"use client"

import React from 'react';
import { Target, Zap, Lightbulb } from 'lucide-react';

const Vision: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Precision',
      description: 'Unparalleled accuracy in every financial calculation. We eliminate human error by combining advanced AI with rigorous validation protocols, ensuring your numbers are always exact.'
    },
    {
      icon: Zap,
      title: 'Autonomy',
      description: 'Self-driving finance workflows designed to operate seamlessly without constant oversight. Our systems learn, adapt, and optimize based on your unique business patterns and goals.'
    },
    {
      icon: Lightbulb,
      title: 'Insight',
      description: 'Deep-learning intelligence to uncover hidden patterns and opportunities that transform your CFO operations into a competitive advantage, revealing insights invisible to traditional analysis.'
    }
  ];

  return (
    <section className="bg-gradient-to-b from-black via-zinc-900 to-black text-white py-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Our Core Values
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Built on the principles of innovation, transparency, and relentless AI 
            improvement.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div 
              key={index}
              className="bg-zinc-900/50 border border-zinc-800 hover:border-orange-500/50 rounded-xl p-8 transition-all duration-300 hover:transform hover:scale-105 group"
            >
              {/* Icon */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-500/10 group-hover:bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center transition-all">
                  <value.icon className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-orange-500 transition-colors">
                {value.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Vision;