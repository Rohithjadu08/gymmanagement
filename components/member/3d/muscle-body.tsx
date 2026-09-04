'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

interface MuscleBodyProps {
  onSelectMuscle: (muscle: string) => void;
  selectedMuscle: string;
}

function BodyMesh({ onSelectMuscle, selectedMuscle }: MuscleBodyProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const muscleColors: Record<string, string> = {
    Chest: selectedMuscle === 'Chest' ? '#f59e0b' : '#ef4444',
    Back: selectedMuscle === 'Back' ? '#f59e0b' : '#3b82f6',
    Legs: selectedMuscle === 'Legs' ? '#f59e0b' : '#10b981',
    Shoulders: selectedMuscle === 'Shoulders' ? '#f59e0b' : '#8b5cf6',
    Arms: selectedMuscle === 'Arms' ? '#f59e0b' : '#ec4899',
    Abs: selectedMuscle === 'Abs' ? '#f59e0b' : '#06b6d4',
  };

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Head */}
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#52525b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.3, 16]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>

      {/* Chest Muscle Group */}
      <mesh
        position={[0, 1.35, 0.22]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectMuscle('Chest');
        }}
      >
        <boxGeometry args={[0.75, 0.5, 0.25]} />
        <meshStandardMaterial
          color={muscleColors['Chest']}
          emissive={selectedMuscle === 'Chest' ? '#f59e0b' : '#000000'}
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Upper Back Muscle Group */}
      <mesh
        position={[0, 1.35, -0.22]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectMuscle('Back');
        }}
      >
        <boxGeometry args={[0.8, 0.6, 0.25]} />
        <meshStandardMaterial
          color={muscleColors['Back']}
          emissive={selectedMuscle === 'Back' ? '#f59e0b' : '#000000'}
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Core / Abs Muscle Group */}
      <mesh
        position={[0, 0.75, 0.18]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectMuscle('Abs');
        }}
      >
        <boxGeometry args={[0.55, 0.55, 0.2]} />
        <meshStandardMaterial
          color={muscleColors['Abs']}
          emissive={selectedMuscle === 'Abs' ? '#f59e0b' : '#000000'}
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Shoulders (Left & Right) */}
      <mesh
        position={[-0.55, 1.5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectMuscle('Shoulders');
        }}
      >
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial
          color={muscleColors['Shoulders']}
          emissive={selectedMuscle === 'Shoulders' ? '#f59e0b' : '#000000'}
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh
        position={[0.55, 1.5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectMuscle('Shoulders');
        }}
      >
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial
          color={muscleColors['Shoulders']}
          emissive={selectedMuscle === 'Shoulders' ? '#f59e0b' : '#000000'}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Arms (Biceps/Triceps - Left & Right) */}
      <mesh
        position={[-0.6, 0.95, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectMuscle('Arms');
        }}
      >
        <cylinderGeometry args={[0.16, 0.14, 0.7, 16]} />
        <meshStandardMaterial
          color={muscleColors['Arms']}
          emissive={selectedMuscle === 'Arms' ? '#f59e0b' : '#000000'}
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh
        position={[0.6, 0.95, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectMuscle('Arms');
        }}
      >
        <cylinderGeometry args={[0.16, 0.14, 0.7, 16]} />
        <meshStandardMaterial
          color={muscleColors['Arms']}
          emissive={selectedMuscle === 'Arms' ? '#f59e0b' : '#000000'}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Legs (Quads / Glutes / Calves - Left & Right) */}
      <mesh
        position={[-0.24, -0.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectMuscle('Legs');
        }}
      >
        <cylinderGeometry args={[0.22, 0.16, 1.4, 16]} />
        <meshStandardMaterial
          color={muscleColors['Legs']}
          emissive={selectedMuscle === 'Legs' ? '#f59e0b' : '#000000'}
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh
        position={[0.24, -0.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectMuscle('Legs');
        }}
      >
        <cylinderGeometry args={[0.22, 0.16, 1.4, 16]} />
        <meshStandardMaterial
          color={muscleColors['Legs']}
          emissive={selectedMuscle === 'Legs' ? '#f59e0b' : '#000000'}
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

export default function MuscleBody3DComponent({ onSelectMuscle, selectedMuscle }: MuscleBodyProps) {
  return (
    <div className="w-full h-[450px] relative rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl">
      <div className="absolute top-4 left-4 z-10 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-700/60 text-[11px] text-zinc-300 pointer-events-none">
        💡 Drag to rotate 3D anatomy • Click a muscle group to view targeting exercises
      </div>

      <Canvas camera={{ position: [0, 1, 4.5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 7]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />

        <BodyMesh onSelectMuscle={onSelectMuscle} selectedMuscle={selectedMuscle} />

        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 6} />
      </Canvas>
    </div>
  );
}
