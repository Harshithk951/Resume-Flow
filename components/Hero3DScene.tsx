"use client";

// components/Hero3DScene.tsx
//
// React Three Fiber scene for the hero section background.
// Features a floating resume card with parallax tilt and particle field.
// Lazy-loaded, desktop-only, with performance auto-downgrade.

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// ─── Particle Field ──────────────────────────────────────
function ParticleField({ count = 120 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sizes[i] = Math.random() * 0.03 + 0.01;
    }

    return { positions, sizes };
  }, [count]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.02;
    mesh.current.rotation.x += delta * 0.01;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#e11d48"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Resume Card Mockup Lines ────────────────────────────
function ResumeCardContent() {
  return (
    <group>
      {/* Card body */}
      <Float
        speed={2}
        rotationIntensity={0.15}
        floatIntensity={0.3}
        floatingRange={[-0.05, 0.05]}
      >
        <RoundedBox args={[2.8, 3.6, 0.06]} radius={0.12} smoothness={4}>
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.3}
            metalness={0.05}
            transparent
            opacity={0.92}
          />
        </RoundedBox>

        {/* Header bar */}
        <mesh position={[0, 1.45, 0.04]}>
          <planeGeometry args={[2.2, 0.15]} />
          <meshStandardMaterial color="#e11d48" roughness={0.5} />
        </mesh>

        {/* Name line */}
        <mesh position={[0, 1.15, 0.04]}>
          <planeGeometry args={[1.6, 0.08]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>

        {/* Subtitle line */}
        <mesh position={[0, 1.0, 0.04]}>
          <planeGeometry args={[1.2, 0.05]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.6} />
        </mesh>

        {/* Section divider */}
        <mesh position={[0, 0.85, 0.04]}>
          <planeGeometry args={[2.2, 0.005]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>

        {/* Content lines */}
        {[0.65, 0.5, 0.35, 0.1, -0.05, -0.3, -0.45, -0.6, -0.85, -1.0, -1.15].map((y, i) => (
          <mesh key={i} position={[-0.15, y, 0.04]}>
            <planeGeometry args={[1.8 - (i % 3) * 0.3, 0.04]} />
            <meshStandardMaterial
              color={i % 5 === 0 ? "#334155" : "#cbd5e1"}
              roughness={0.6}
            />
          </mesh>
        ))}

        {/* Score badge */}
        <mesh position={[0.9, -1.4, 0.04]}>
          <circleGeometry args={[0.18, 32]} />
          <meshStandardMaterial color="#22c55e" roughness={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

// ─── Mouse Parallax Camera Controller ────────────────────
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useFrame(() => {
    // Gentle parallax tilt based on mouse
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      mouse.current.x * 0.5,
      0.05
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      mouse.current.y * 0.3 + 0.2,
      0.05
    );
    camera.lookAt(0, 0, 0);
  });

  // Track mouse movement
  if (typeof window !== "undefined") {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }
  }

  return null;
}

// ─── Main Scene ──────────────────────────────────────────
export default function Hero3DScene() {
  return (
    <div className="absolute inset-0 -z-10 opacity-60 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0.2, 5.5], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.6}
            castShadow={false}
          />
          <pointLight position={[-3, 2, 4]} intensity={0.3} color="#e11d48" />

          {/* Scene Content */}
          <group rotation={[0.05, -0.15, 0.02]}>
            <ResumeCardContent />
          </group>
          <ParticleField count={100} />

          {/* Camera parallax */}
          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
