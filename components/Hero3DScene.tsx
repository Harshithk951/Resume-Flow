"use client";

// components/Hero3DScene.tsx
//
// React Three Fiber scene for the hero section background.
// Features a floating resume card with parallax tilt and particle field.
// Lazy-loaded, desktop-only, with performance auto-downgrade.

import { useRef, useMemo, useEffect, Suspense, useState } from "react";
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
        <RoundedBox args={[2.8, 3.6, 0.06]} radius={0.12} smoothness={2}>
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
          <meshBasicMaterial color="#e11d48" />
        </mesh>

        {/* Name line */}
        <mesh position={[0, 1.15, 0.04]}>
          <planeGeometry args={[1.6, 0.08]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>

        {/* Subtitle line */}
        <mesh position={[0, 1.0, 0.04]}>
          <planeGeometry args={[1.2, 0.05]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>

        {/* Section divider */}
        <mesh position={[0, 0.85, 0.04]}>
          <planeGeometry args={[2.2, 0.005]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>

        {/* Content lines */}
        {[0.65, 0.5, 0.35, 0.1, -0.05, -0.3, -0.45, -0.6, -0.85, -1.0, -1.15].map((y, i) => (
          <mesh key={i} position={[-0.15, y, 0.04]}>
            <planeGeometry args={[1.8 - (i % 3) * 0.3, 0.04]} />
            <meshBasicMaterial
              color={i % 5 === 0 ? "#334155" : "#cbd5e1"}
            />
          </mesh>
        ))}

        {/* Score badge */}
        <mesh position={[0.9, -1.4, 0.04]}>
          <circleGeometry args={[0.18, 16]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </Float>
    </group>
  );
}

// ─── Mouse Parallax Camera Controller ────────────────────
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

  return null;
}

// ─── WebGL Support Detection Helper ─────────────────────
function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

// ─── Main Scene ──────────────────────────────────────────
export default function Hero3DScene({ inView = true }: { inView?: boolean }) {
  const isSupported = useMemo(() => checkWebGLSupport(), []);
  const [shouldRender, setShouldRender] = useState(false);
  const [hasContextError, setHasContextError] = useState(false);

  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
  }, []);

  // Performance Optimization: Defer mounting 3D Canvas until 1.5s after load or user interaction (unblocks LCP)
  useEffect(() => {
    if (typeof window === "undefined" || !isSupported) return;

    let timer: NodeJS.Timeout;
    const triggerRender = () => {
      setShouldRender(true);
      cleanup();
    };

    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", triggerRender);
      window.removeEventListener("scroll", triggerRender);
      window.removeEventListener("touchstart", triggerRender);
    };

    timer = setTimeout(triggerRender, 1500);

    window.addEventListener("mousemove", triggerRender, { passive: true });
    window.addEventListener("scroll", triggerRender, { passive: true });
    window.addEventListener("touchstart", triggerRender, { passive: true });

    return cleanup;
  }, [isSupported]);

  // Elegant fallback layout: simple clean gradient orb
  const fallbackGradient = (
    <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none bg-radial from-rose-500/10 to-transparent blur-3xl"></div>
  );

  if (!isSupported || hasContextError || !shouldRender) {
    return fallbackGradient;
  }

  return (
    <div className="absolute inset-0 -z-10 opacity-60 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0.2, 5.5], fov: 35 }}
        dpr={1} // Cap at 1 to minimize presentation delays/INP on high-dpi screens
        frameloop={inView ? "always" : "never"}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          // Robust context lost handling to prevent console crashes and switch to static fallback
          const handleContextLost = (e: Event) => {
            e.preventDefault();
            console.warn("WebGL context lost. Falling back to static gradient rendering.");
            setHasContextError(true);
          };
          gl.domElement.addEventListener("webglcontextlost", handleContextLost);
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
          <ParticleField count={isMobile ? 30 : 80} />

          {/* Camera parallax */}
          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
