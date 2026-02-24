import React from 'react';
import { ArrowRight } from 'lucide-react';

const Heading: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white py-20 px-4 sm:px-8 overflow-hidden">
      {/* Enhanced 3D Background Graphics */}
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-40 overflow-hidden">
        {/* Floating 3D Cubes with rotation animation */}
        <div className="absolute top-20 right-20 w-64 h-64 animate-float-slow">
          <div className="relative w-full h-full transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 border-2 border-orange-500/40 transform rotate-45 animate-spin-slow">
              <div className="absolute inset-4 border border-orange-500/30 animate-pulse"></div>
              <div className="absolute inset-8 border border-orange-500/20"></div>
              <div className="absolute inset-12 border border-orange-500/10"></div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full animate-pulse-slow"></div>
        </div>

        {/* Secondary rotating cube */}
        <div className="absolute top-40 right-40 w-32 h-32 animate-float-reverse">
          <div className="absolute inset-0 border-2 border-orange-500/30 transform -rotate-12 animate-spin-reverse">
            <div className="absolute inset-2 border border-orange-500/20"></div>
            <div className="absolute inset-4 border border-orange-500/10"></div>
          </div>
        </div>

        {/* Floating hexagon */}
        <div className="absolute bottom-40 right-32 w-40 h-40 animate-float-slow" style={{ animationDelay: '1s' }}>
          <div className="absolute inset-0 transform rotate-30">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-very-slow">
              <polygon
                points="50 1 95 25 95 75 50 99 5 75 5 25"
                fill="none"
                stroke="rgb(249 115 22 / 0.3)"
                strokeWidth="1.5"
              />
              <polygon
                points="50 10 85 30 85 70 50 90 15 70 15 30"
                fill="none"
                stroke="rgb(249 115 22 / 0.2)"
                strokeWidth="1"
              />
            </svg>
          </div>
        </div>

        {/* Orbiting particles */}
        <div className="absolute top-1/3 right-1/4 w-64 h-64">
          <div className="relative w-full h-full animate-spin-orbit">
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50 -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-orange-400 rounded-full shadow-lg shadow-orange-400/50 -translate-x-1/2"></div>
          </div>
        </div>

        {/* Animated dot grid pattern */}
        <div className="absolute inset-0 opacity-20 animate-grid-move"
          style={{
            backgroundImage: 'radial-gradient(circle, #f97316 1.5px, transparent 1.5px)',
            backgroundSize: '40px 40px'
          }}>
        </div>

        {/* Diagonal lines moving */}
        <div className="absolute inset-0 opacity-10 animate-lines-move"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, #f97316 35px, #f97316 36px)',
          }}>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-orange-500 rounded-full animate-ping-slow"></div>
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-orange-400 rounded-full animate-ping-slow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/4 right-1/2 w-2 h-2 bg-orange-500 rounded-full animate-ping-slow" style={{ animationDelay: '3s' }}></div>

        {/* Wireframe sphere */}
        <div className="absolute bottom-20 right-20 w-48 h-48 animate-float-slow" style={{ animationDelay: '2s' }}>
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-pulse-slow"></div>
            <div className="absolute inset-4 rounded-full border border-orange-500/20"></div>
            <div className="absolute inset-8 rounded-full border border-orange-500/10"></div>
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-orange-500/30 via-orange-500/20 to-transparent -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500/30 via-orange-500/20 to-transparent -translate-y-1/2"></div>
          </div>
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.2))' }}>
          <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="#f97316" strokeWidth="1" opacity="0.2" className="animate-dash">
            <animate attributeName="stroke-dashoffset" from="0" to="100" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="80%" y1="20%" x2="20%" y2="80%" stroke="#f97316" strokeWidth="1" opacity="0.2" className="animate-dash">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4s" repeatCount="indefinite" />
          </line>
          <circle cx="20%" cy="20%" r="3" fill="#f97316" opacity="0.4">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="80%" r="3" fill="#f97316" opacity="0.4">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" begin="1s" />
          </circle>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className='mt-10'>
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-500 text-xs font-semibold uppercase tracking-wider">
                AI-POWERED CFO INSIGHTS
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Pioneering<br />
              Financial<br />
              <span className="text-orange-500">Intelligence</span>
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-lg mb-8 max-w-xl">
              Transform the way you manage CFO work with AI-driven analytics and automation. We
              are pioneering a new standard where intelligent systems collaborate with your entire
              financial leadership.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105">
                Schedule a Demo
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-semibold px-8 py-4 rounded-lg transition-all">
                View Demo
              </button>
            </div>
          </div>

          {/* Right Content - 3D Visualization */}
          <div className="relative flex items-center justify-center min-h-[450px]"
            style={{ perspective: '800px' }}>

            {/* Ambient glow behind everything */}
            <div className="absolute w-72 h-72 bg-orange-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }}></div>

            {/* === 3D ROTATING CUBE === */}
            <div className="cube-scene" style={{ transformStyle: 'preserve-3d', animation: 'cubeFloat 6s ease-in-out infinite' }}>
              <div className="cube-wrapper" style={{
                width: '160px', height: '160px',
                transformStyle: 'preserve-3d',
                animation: 'cubeRotate 12s linear infinite'
              }}>
                {/* Front face */}
                <div className="absolute inset-0 border-2 border-orange-500/50 bg-orange-500/5 backdrop-blur-sm rounded-lg"
                  style={{ transform: 'translateZ(80px)' }}>
                  <div className="absolute inset-3 border border-orange-400/30 rounded"></div>
                  <div className="absolute top-3 left-3 w-2 h-2 bg-orange-500 rounded-full shadow-lg shadow-orange-500/80" style={{ animation: 'nodePulse 2s ease-in-out infinite' }}></div>
                  <div className="absolute bottom-3 right-3 w-2 h-2 bg-orange-400 rounded-full shadow-lg shadow-orange-400/80" style={{ animation: 'nodePulse 2s ease-in-out infinite 0.5s' }}></div>
                </div>
                {/* Back face */}
                <div className="absolute inset-0 border-2 border-orange-500/30 bg-orange-500/5 rounded-lg"
                  style={{ transform: 'translateZ(-80px) rotateY(180deg)' }}>
                  <div className="absolute inset-3 border border-orange-400/20 rounded"></div>
                </div>
                {/* Left face */}
                <div className="absolute inset-0 border-2 border-orange-500/40 bg-orange-500/5 rounded-lg"
                  style={{ transform: 'rotateY(-90deg) translateZ(80px)' }}>
                  <div className="absolute inset-3 border border-orange-400/25 rounded"></div>
                </div>
                {/* Right face */}
                <div className="absolute inset-0 border-2 border-orange-500/40 bg-orange-500/5 rounded-lg"
                  style={{ transform: 'rotateY(90deg) translateZ(80px)' }}>
                  <div className="absolute inset-3 border border-orange-400/25 rounded"></div>
                </div>
                {/* Top face */}
                <div className="absolute inset-0 border-2 border-orange-500/50 bg-orange-500/8 rounded-lg"
                  style={{ transform: 'rotateX(90deg) translateZ(80px)' }}>
                  <div className="absolute inset-3 border border-orange-400/30 rounded"></div>
                  {/* Cross lines */}
                  <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>
                  <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-orange-500/40 to-transparent"></div>
                </div>
                {/* Bottom face */}
                <div className="absolute inset-0 border-2 border-orange-500/30 bg-orange-500/5 rounded-lg"
                  style={{ transform: 'rotateX(-90deg) translateZ(80px)' }}>
                  <div className="absolute inset-3 border border-orange-400/20 rounded"></div>
                </div>

                {/* Energy core inside the cube */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10"
                  style={{ transformStyle: 'preserve-3d' }}>
                  <div className="w-full h-full bg-orange-500 rounded-full shadow-[0_0_40px_15px_rgba(249,115,22,0.4)] animate-pulse" style={{ animationDuration: '2s' }}></div>
                </div>
              </div>
            </div>

            {/* === ORBITAL RING 1 === */}
            <div className="absolute w-[320px] h-[320px]"
              style={{
                border: '1.5px solid rgba(249, 115, 22, 0.25)',
                borderRadius: '50%',
                transform: 'rotateX(70deg) rotateZ(20deg)',
                animation: 'orbitSpin 8s linear infinite',
              }}>
              {/* Orbiting node */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_12px_4px_rgba(249,115,22,0.6)]"></div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_8px_3px_rgba(251,146,60,0.5)]"></div>
            </div>

            {/* === ORBITAL RING 2 (counter-rotating) === */}
            <div className="absolute w-[260px] h-[260px]"
              style={{
                border: '1px solid rgba(249, 115, 22, 0.15)',
                borderRadius: '50%',
                transform: 'rotateX(60deg) rotateZ(-40deg)',
                animation: 'orbitSpinReverse 10s linear infinite',
              }}>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_8px_3px_rgba(251,146,60,0.4)]"></div>
            </div>

            {/* === ORBITAL RING 3 (vertical) === */}
            <div className="absolute w-[380px] h-[380px]"
              style={{
                border: '1px dashed rgba(249, 115, 22, 0.12)',
                borderRadius: '50%',
                transform: 'rotateY(70deg) rotateZ(10deg)',
                animation: 'orbitSpin 14s linear infinite',
              }}>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-300 rounded-full shadow-[0_0_6px_2px_rgba(253,186,116,0.4)]"></div>
            </div>

            {/* === DATA STREAM PARTICLES === */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div key={i}
                  className="absolute w-1 h-1 bg-orange-500 rounded-full"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${10 + Math.random() * 80}%`,
                    opacity: 0.4 + Math.random() * 0.4,
                    animation: `dataParticle ${3 + Math.random() * 4}s ease-in-out ${i * 0.5}s infinite`,
                    boxShadow: '0 0 6px 2px rgba(249,115,22,0.3)',
                  }}
                ></div>
              ))}
            </div>

            {/* === HOLOGRAPHIC GRID BASE === */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[120px] opacity-30"
              style={{
                transform: 'translateX(-50%) rotateX(75deg)',
                backgroundImage: `
                     linear-gradient(rgba(249,115,22,0.2) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(249,115,22,0.2) 1px, transparent 1px)
                   `,
                backgroundSize: '30px 30px',
                maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
              }}>
            </div>

            {/* === FLOATING METRICS === */}
            <div className="absolute top-8 right-4 bg-zinc-900/80 backdrop-blur border border-orange-500/20 rounded-lg px-3 py-2 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="text-[10px] text-gray-500 uppercase">Neural Load</div>
              <div className="text-sm font-bold text-orange-500">98.7%</div>
            </div>
            <div className="absolute bottom-12 left-4 bg-zinc-900/80 backdrop-blur border border-orange-500/20 rounded-lg px-3 py-2 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
              <div className="text-[10px] text-gray-500 uppercase">Vectors</div>
              <div className="text-sm font-bold text-green-400">+2.4M</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Heading;