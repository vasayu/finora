"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

function ProfessionalCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[2, 0.6, 128, 32]} />
        <MeshDistortMaterial
          color={isDark ? "#ea580c" : "#f97316"}
          envMapIntensity={isDark ? 0.8 : 2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.8}
          roughness={0.2}
          distort={0.4}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
}

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 bg-background transition-colors duration-500">
      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/10 via-background/80 to-background z-10 pointer-events-none" />
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        className="opacity-70 dark:opacity-100 transition-opacity duration-500"
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={1.5} color="#fb923c" />
        <spotLight position={[-10, -10, -10]} intensity={1} color="#ea580c" />
        <ProfessionalCore />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
