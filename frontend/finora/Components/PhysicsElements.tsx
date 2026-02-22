"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Html, Float } from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";

// Simulated 3D Card
const Card = ({
  position,
  rotation,
  label,
  error,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  label: string;
  error?: string;
  color: string;
}) => {
  return (
    <RigidBody
      position={position}
      rotation={rotation}
      colliders="cuboid"
      restitution={0.2}
      friction={1}
    >
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 2, 0.1]} />
          <meshPhysicalMaterial
            color={color}
            transmission={0.9}
            opacity={1}
            metalness={0.1}
            roughness={0.1}
            ior={1.5}
            thickness={2}
            specularIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
          <Html transform distanceFactor={1.5} position={[0, 0, 0.06]}>
            <div className="w-[300px] h-[200px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col justify-between p-4 shadow-2xl relative overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${error ? "bg-red-500 animate-pulse" : "bg-green-500"}`}
                />
                <span className="text-white/80 font-mono text-sm">{label}</span>
              </div>

              <div className="space-y-2 mt-4">
                <div className="h-2 bg-white/10 rounded w-full animate-pulse blur-[1px]" />
                <div className="h-2 bg-white/10 rounded w-3/4 animate-pulse blur-[1px]" />
                <div className="h-2 bg-white/10 rounded w-1/2 animate-pulse blur-[1px]" />
              </div>

              {error && (
                <div className="mt-auto px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-mono rounded w-max">
                  {error}
                </div>
              )}
            </div>
          </Html>
        </mesh>
      </Float>
    </RigidBody>
  );
};

// Floor / Invisible Boundaries
const Boundaries = () => {
  return (
    <>
      <CuboidCollider position={[0, -5, 0]} args={[10, 1, 10]} />
      <CuboidCollider position={[0, 10, 0]} args={[10, 1, 10]} />
      <CuboidCollider position={[-10, 0, 0]} args={[1, 10, 10]} />
      <CuboidCollider position={[10, 0, 0]} args={[1, 10, 10]} />
      <CuboidCollider position={[0, 0, -5]} args={[10, 10, 1]} />
      <CuboidCollider position={[0, 0, 5]} args={[10, 10, 1]} />
    </>
  );
};

export default function PhysicsElements() {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-0 translate-y-20 animate-fade-in-up"
      style={{ animationDelay: "1s", animationFillMode: "forwards" }}
    >
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <spotLight
          position={[-10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={2}
          color="#FFB800"
        />

        <Environment preset="city" />

        <Physics gravity={[0, 0, 0]}>
          <Boundaries />

          {/* Drifting Cards */}
          <Card
            position={[-1, 2, -1]}
            rotation={[0.1, 0.4, -0.1]}
            label="Q3_Forecast_FINAL_v4.xlsx"
            error="Formula Error #REF!"
            color="#222222"
          />

          <Card
            position={[2, 0, 0]}
            rotation={[-0.2, -0.3, 0.1]}
            label="ERP_CORE_V2"
            error="SYNC_ERROR TIMEOUT"
            color="#1a1a1a"
          />

          <Card
            position={[-2, -2, 1]}
            rotation={[0.3, 0.1, 0.2]}
            label="#INV-2024-001"
            error="Status: UNMATCHED"
            color="#2a2a2a"
          />
          <Card
            position={[1.5, -3, -2]}
            rotation={[-0.1, 0.5, -0.2]}
            label="PAYROLL_OCTOBER.csv"
            color="#1e1e1e"
          />
        </Physics>
      </Canvas>

      {/* Global styles for the initial animation */}
      <style>{`
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(100px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
