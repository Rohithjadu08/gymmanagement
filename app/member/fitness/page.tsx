'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getExercises } from '@/lib/data-service';
import { Exercise } from '@/types/database.types';
import { Sparkles, Dumbbell, Flame, Layers, Info, CheckCircle2, ChevronRight } from 'lucide-react';

// Dynamic import with SSR disabled to ensure Three.js is loaded client-side only
const MuscleBody3D = dynamic(() => import('@/components/member/3d/muscle-body'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-xs font-semibold">Initializing 3D Muscle Canvas...</p>
      </div>
    </div>
  ),
});

export default function MemberFitness3DPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Chest');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const muscleGroups = ['ALL', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'];

  useEffect(() => {
    async function loadExercises() {
      setLoading(true);
      const data = await getExercises(selectedMuscle === 'ALL' ? undefined : selectedMuscle);
      setExercises(data);
      setLoading(false);
    }
    loadExercises();
  }, [selectedMuscle]);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Interactive 3D Fitness & Muscle Anatomy</h1>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Explore target muscle groups on the 3D model to view trainer exercise recommendations and execution form guides.
        </p>
      </div>

      {/* 3D Canvas */}
      <MuscleBody3D
        selectedMuscle={selectedMuscle}
        onSelectMuscle={(muscle) => setSelectedMuscle(muscle)}
      />

      {/* Muscle Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {muscleGroups.map((muscle) => {
          const isActive = selectedMuscle === muscle;
          return (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              {muscle === 'ALL' ? 'All Muscle Groups' : muscle}
            </button>
          );
        })}
      </div>

      {/* Targeted Exercise Recommendation Drawer */}
      <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-amber-400" />
              Target Exercises for <span className="text-amber-400">{selectedMuscle}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {exercises.length} prescribed movements available in gym library
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {selectedMuscle} Focus
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : exercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="p-5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{ex.name}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Equipment: <span className="text-zinc-300 font-medium">{ex.equipment}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-zinc-800 text-amber-400 border border-zinc-700">
                    {ex.difficulty}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{ex.description}</p>

                {ex.instructions && (
                  <div className="pt-2 border-t border-zinc-800/60">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Proper Form Steps:
                    </span>
                    <ol className="space-y-1 text-xs text-zinc-400 list-decimal list-inside">
                      {ex.instructions.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800">
            <p className="text-zinc-400 text-sm">No exercises found for this muscle group.</p>
          </div>
        )}
      </div>
    </div>
  );
}

