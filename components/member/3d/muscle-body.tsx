'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RefreshCw, RotateCw, Eye, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MuscleBodyProps {
  onSelectMuscle: (muscle: string) => void;
  selectedMuscle: string;
}

export type MuscleGroupType =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Abs'
  | 'Glutes'
  | 'Quadriceps'
  | 'Hamstrings'
  | 'Calves';

// Pre-load GLTF model for fast client rendering
useGLTF.preload('/models/male/scene.gltf');

// Form-fitting Anatomical Muscle Overlay Component
function MuscleRegionOverlay({
  name,
  selectedMuscle,
  onSelectMuscle,
  hoveredMuscle,
  setHoveredMuscle,
  children,
}: {
  name: MuscleGroupType;
  selectedMuscle: string;
  onSelectMuscle: (muscle: string) => void;
  hoveredMuscle: string | null;
  setHoveredMuscle: (muscle: string | null) => void;
  children: React.ReactNode;
}) {
  const isSelected = selectedMuscle === name;
  const isHovered = hoveredMuscle === name;
  const isActive = isSelected || isHovered;

  return (
    <group
      visible={isActive}
      onClick={(e) => {
        e.stopPropagation();
        onSelectMuscle(name);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredMuscle(name);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHoveredMuscle(null);
        document.body.style.cursor = 'auto';
      }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            children: (
              <>
                {(child.props as any).children}
                <meshStandardMaterial
                  color={isSelected ? '#f59e0b' : '#38bdf8'}
                  emissive={isSelected ? '#f59e0b' : '#0284c7'}
                  emissiveIntensity={isSelected ? 0.9 : 0.5}
                  transparent={true}
                  opacity={isSelected ? 0.85 : 0.6}
                  metalness={0.4}
                  roughness={0.2}
                />
              </>
            ),
          });
        }
        return child;
      })}
    </group>
  );
}

// Main 3D Human Model component loading the GLTF mesh
function HumanAnatomicalModel({
  selectedMuscle,
  onSelectMuscle,
  autoRotate,
  targetRotationY,
}: {
  selectedMuscle: string;
  onSelectMuscle: (muscle: string) => void;
  autoRotate: boolean;
  targetRotationY: number | null;
}) {
  const { scene } = useGLTF('/models/male/scene.gltf');
  const bodyGroupRef = useRef<THREE.Group>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  // Apply dark metallic gym studio material to the base GLTF human mesh
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color = new THREE.Color('#4b5563'); // Titanium Slate dark human finish
          mat.metalness = 0.45;
          mat.roughness = 0.35;
        }
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!bodyGroupRef.current) return;

    if (targetRotationY !== null) {
      bodyGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        bodyGroupRef.current.rotation.y,
        targetRotationY,
        delta * 6
      );
    } else if (autoRotate) {
      bodyGroupRef.current.rotation.y += delta * 0.35;
    }
  });

  const overlayProps = (name: MuscleGroupType) => ({
    name,
    selectedMuscle,
    onSelectMuscle,
    hoveredMuscle,
    setHoveredMuscle,
  });

  return (
    <group ref={bodyGroupRef} position={[0, -1.35, 0]} scale={[0.9, 0.9, 0.9]}>
      {/* Base GLTF Human Body Mesh */}
      <primitive object={scene} />

      {/* ------------------------------------------------------------- */}
      {/* 11 ANATOMICAL MUSCLE OVERLAY REGIONS FOR HIGHLIGHTING          */}
      {/* ------------------------------------------------------------- */}

      {/* 1. CHEST */}
      <MuscleRegionOverlay {...overlayProps('Chest')}>
        <mesh position={[-0.14, 2.18, 0.14]} rotation={[0.1, 0.1, 0]}>
          <boxGeometry args={[0.26, 0.28, 0.14]} />
        </mesh>
        <mesh position={[0.14, 2.18, 0.14]} rotation={[0.1, -0.1, 0]}>
          <boxGeometry args={[0.26, 0.28, 0.14]} />
        </mesh>
      </MuscleRegionOverlay>

      {/* 2. BACK */}
      <MuscleRegionOverlay {...overlayProps('Back')}>
        <mesh position={[0, 2.25, -0.12]}>
          <boxGeometry args={[0.48, 0.35, 0.14]} />
        </mesh>
        <mesh position={[-0.24, 1.95, -0.11]} rotation={[0, -0.15, 0.2]}>
          <boxGeometry args={[0.22, 0.45, 0.12]} />
        </mesh>
        <mesh position={[0.24, 1.95, -0.11]} rotation={[0, 0.15, -0.2]}>
          <boxGeometry args={[0.22, 0.45, 0.12]} />
        </mesh>
      </MuscleRegionOverlay>

      {/* 3. ABS */}
      <MuscleRegionOverlay {...overlayProps('Abs')}>
        <mesh position={[0, 1.82, 0.12]}>
          <boxGeometry args={[0.26, 0.38, 0.12]} />
        </mesh>
      </MuscleRegionOverlay>

      {/* 4. SHOULDERS */}
      <MuscleRegionOverlay {...overlayProps('Shoulders')}>
        <mesh position={[-0.42, 2.25, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
        </mesh>
        <mesh position={[0.42, 2.25, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
        </mesh>
      </MuscleRegionOverlay>

      {/* 5. BICEPS */}
      <MuscleRegionOverlay {...overlayProps('Biceps')}>
        <mesh position={[-0.44, 1.92, 0.05]} rotation={[0.1, 0, 0.1]}>
          <cylinderGeometry args={[0.1, 0.08, 0.32, 16]} />
        </mesh>
        <mesh position={[0.44, 1.92, 0.05]} rotation={[0.1, 0, -0.1]}>
          <cylinderGeometry args={[0.1, 0.08, 0.32, 16]} />
        </mesh>
      </MuscleRegionOverlay>

      {/* 6. TRICEPS */}
      <MuscleRegionOverlay {...overlayProps('Triceps')}>
        <mesh position={[-0.44, 1.92, -0.06]} rotation={[-0.1, 0, 0.1]}>
          <cylinderGeometry args={[0.1, 0.08, 0.32, 16]} />
        </mesh>
        <mesh position={[0.44, 1.92, -0.06]} rotation={[-0.1, 0, -0.1]}>
          <cylinderGeometry args={[0.1, 0.08, 0.32, 16]} />
        </mesh>
      </MuscleRegionOverlay>

      {/* 7. FOREARMS */}
      <MuscleRegionOverlay {...overlayProps('Forearms')}>
        <mesh position={[-0.48, 1.48, 0.04]} rotation={[0.1, 0, 0.15]}>
          <cylinderGeometry args={[0.08, 0.06, 0.42, 16]} />
        </mesh>
        <mesh position={[0.48, 1.48, 0.04]} rotation={[0.1, 0, -0.15]}>
          <cylinderGeometry args={[0.08, 0.06, 0.42, 16]} />
        </mesh>
      </MuscleRegionOverlay>

      {/* 8. GLUTES */}
      <MuscleRegionOverlay {...overlayProps('Glutes')}>
        <mesh position={[-0.16, 1.42, -0.12]}>
          <sphereGeometry args={[0.18, 16, 16]} />
        </mesh>
        <mesh position={[0.16, 1.42, -0.12]}>
          <sphereGeometry args={[0.18, 16, 16]} />
        </mesh>
      </MuscleRegionOverlay>

      {/* 9. QUADRICEPS */}
      <MuscleRegionOverlay {...overlayProps('Quadriceps')}>
        <mesh position={[-0.18, 0.95, 0.08]} rotation={[0.05, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.1, 0.65, 16]} />
        </mesh>
        <mesh position={[0.18, 0.95, 0.08]} rotation={[0.05, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.1, 0.65, 16]} />
        </mesh>
      </MuscleRegionOverlay>

      {/* 10. HAMSTRINGS */}
      <MuscleRegionOverlay {...overlayProps('Hamstrings')}>
        <mesh position={[-0.18, 0.95, -0.08]} rotation={[-0.05, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.1, 0.65, 16]} />
        </mesh>
        <mesh position={[0.18, 0.95, -0.08]} rotation={[-0.05, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.1, 0.65, 16]} />
        </mesh>
      </MuscleRegionOverlay>

      {/* 11. CALVES */}
      <MuscleRegionOverlay {...overlayProps('Calves')}>
        <mesh position={[-0.18, 0.35, -0.04]}>
          <cylinderGeometry args={[0.1, 0.06, 0.55, 16]} />
        </mesh>
        <mesh position={[0.18, 0.35, -0.04]}>
          <cylinderGeometry args={[0.1, 0.06, 0.55, 16]} />
        </mesh>
      </MuscleRegionOverlay>

      {/* Dynamic 3D Label Badge above Head */}
      {(hoveredMuscle || selectedMuscle) && (
        <Html position={[0, 2.75, 0]} center distanceFactor={7}>
          <div className="bg-zinc-950/95 text-amber-300 font-extrabold px-3.5 py-1.5 rounded-xl border border-amber-500/50 text-xs shadow-2xl backdrop-blur-md whitespace-nowrap flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{hoveredMuscle || selectedMuscle}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function LoadingCanvasFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 bg-zinc-950/90 p-4 rounded-xl border border-zinc-800 backdrop-blur-md">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-300 font-semibold">Loading 3D Anatomy Model...</p>
      </div>
    </Html>
  );
}

export default function MuscleBody3DComponent({ onSelectMuscle, selectedMuscle }: MuscleBodyProps) {
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [targetRotationY, setTargetRotationY] = useState<number | null>(null);
  const controlsRef = useRef<any>(null);

  const handleSetFrontView = () => {
    setAutoRotate(false);
    setTargetRotationY(0);
  };

  const handleSetBackView = () => {
    setAutoRotate(false);
    setTargetRotationY(Math.PI);
  };

  const handleResetCamera = () => {
    setAutoRotate(false);
    setTargetRotationY(0);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="w-full h-[520px] relative rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl flex flex-col justify-between">
      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Instruction Badge */}
        <div className="bg-zinc-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-zinc-700/60 text-xs text-zinc-300 pointer-events-auto flex items-center gap-2 shadow-lg">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Click any body region to view exercises</span>
        </div>

        {/* View Angle & Rotation Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-zinc-900/90 backdrop-blur-md p-1 rounded-xl border border-zinc-700/60 shadow-lg">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSetFrontView}
            className="text-xs h-7 px-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            Front View
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleSetBackView}
            className="text-xs h-7 px-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            Back View
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setTargetRotationY(null);
              setAutoRotate(!autoRotate);
            }}
            className={`text-xs h-7 px-2.5 rounded-lg transition-colors ${
              autoRotate
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <RotateCw className={`w-3 h-3 mr-1 ${autoRotate ? 'animate-spin' : ''}`} /> Auto-Rotate
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetCamera}
            className="text-xs h-7 px-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Reset camera view"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div className="w-full h-full">
        <Canvas camera={{ position: [0, 0.2, 3.8], fov: 45 }}>
          {/* Studio Lighting Setup */}
          <ambientLight intensity={0.65} />
          <directionalLight position={[4, 8, 5]} intensity={1.3} color="#ffffff" />
          <directionalLight position={[-4, 4, 3]} intensity={0.5} color="#94a3b8" />
          {/* Rim light from behind */}
          <directionalLight position={[0, 4, -5]} intensity={1.6} color="#f59e0b" />
          <pointLight position={[0, -2, 2]} intensity={0.4} color="#06b6d4" />

          <Suspense fallback={<LoadingCanvasFallback />}>
            <HumanAnatomicalModel
              selectedMuscle={selectedMuscle}
              onSelectMuscle={onSelectMuscle}
              autoRotate={autoRotate}
              targetRotationY={targetRotationY}
            />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            minDistance={2.0}
            maxDistance={6.5}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 6}
          />
        </Canvas>
      </div>

      {/* Bottom Selected Muscle Indicator Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Active Highlight:</span>
          <span className="font-bold text-amber-400 uppercase tracking-wider">{selectedMuscle || 'All Muscles'}</span>
        </div>

        <div className="text-[11px] text-zinc-400">
          Showing targeting exercises for <span className="text-amber-300">{selectedMuscle}</span>
        </div>
      </div>
    </div>
  );
}
