'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getExercises, getWorkoutsForMember, getWorkoutLogsForMember } from '@/lib/data-service';
import { Exercise, WorkoutWithDetails, WorkoutLog } from '@/types/database.types';
import { ExerciseDetailModal } from '@/components/member/exercise-detail-modal';
import {
  Sparkles,
  Dumbbell,
  Flame,
  Layers,
  Info,
  CheckCircle2,
  ChevronRight,
  Target,
  CalendarCheck,
  Award,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Dynamic import with SSR disabled to ensure Three.js is loaded client-side only
const MuscleBody3D = dynamic(() => import('@/components/member/3d/muscle-body'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-xs font-semibold">Initializing 3D Muscle Anatomy Engine...</p>
      </div>
    </div>
  ),
});

const ALL_MUSCLE_GROUPS = [
  'ALL',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Abs',
  'Glutes',
  'Quadriceps',
  'Hamstrings',
  'Calves',
];

export default function MemberFitness3DPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Chest');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const memberId = 'mem-1'; // Current logged-in member ID

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [exData, wData, lData] = await Promise.all([
          getExercises(selectedMuscle === 'ALL' ? undefined : selectedMuscle),
          getWorkoutsForMember(memberId),
          getWorkoutLogsForMember(memberId),
        ]);
        setExercises(exData);
        setWorkouts(wData);
        setWorkoutLogs(lData);
      } catch (err) {
        console.error('Error fetching member fitness data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedMuscle]);

  const handleOpenExercise = (ex: Exercise) => {
    setSelectedExercise(ex);
    setIsModalOpen(true);
  };

  const handleLogSaved = (newLog: WorkoutLog) => {
    setWorkoutLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/images/shiva-gym-logo.png"
              alt="SHIVA GYM Logo"
              className="w-12 h-12 rounded-xl border border-amber-500/30 object-contain bg-zinc-950 p-1 shadow-md shrink-0"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                SHIVA GYM — Interactive 3D Fitness & Anatomy
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Rotate & select muscle regions on the 3D model to explore target exercises, form instructions, and log your progress.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1 text-xs">
            <Activity className="w-3.5 h-3.5 mr-1 text-amber-400" /> Shiva Gym Interactive Portal
          </Badge>
        </div>
      </div>

      {/* 3D Anatomical Canvas */}
      <div className="space-y-3">
        <MuscleBody3D
          selectedMuscle={selectedMuscle === 'ALL' ? '' : selectedMuscle}
          onSelectMuscle={(muscle) => setSelectedMuscle(muscle)}
        />
      </div>

      {/* Muscle Selector Chips (11 Major Muscle Regions + ALL) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" /> Major Muscle Groups
          </span>
          <span className="text-[11px] text-zinc-500">
            Click chip or 3D body region to filter
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ALL_MUSCLE_GROUPS.map((muscle) => {
            const isActive = selectedMuscle === muscle;
            return (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />}
                {muscle === 'ALL' ? 'All Muscle Groups' : muscle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Assigned Member Workouts Overview */}
      {workouts.length > 0 && (
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Your Assigned Workouts</h3>
                <p className="text-[11px] text-zinc-400">Personalized programs assigned by Shiva Gym trainers</p>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-xs">
              {workouts.length} Programs
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">{w.name}</h4>
                    <p className="text-[11px] text-zinc-400">{w.description}</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                    {w.status}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{w.workout_exercises?.length || 0} Exercises included</span>
                  <span>Assigned {w.assigned_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Targeted Exercise Cards Library */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-amber-400" />
              Exercises for <span className="text-amber-400">{selectedMuscle === 'ALL' ? 'All Muscles' : selectedMuscle}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {exercises.length} prescribed movements available in gym library
            </p>
          </div>

          <Badge variant="outline" className="border-amber-500/40 text-amber-300 text-xs self-start sm:self-auto">
            {selectedMuscle} Target
          </Badge>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-zinc-400">Loading exercises for {selectedMuscle}...</p>
          </div>
        ) : exercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => handleOpenExercise(ex)}
                className="group relative p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/50 hover:bg-zinc-950/90 transition-all cursor-pointer shadow-md flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {ex.name}
                    </h3>
                    <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-300 whitespace-nowrap">
                      {ex.difficulty}
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{ex.description}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-zinc-900">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3 h-3 text-amber-400" /> {ex.equipment}
                    </span>
                    <span className="text-amber-300/80 font-medium">{ex.muscle_group}</span>
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 font-semibold text-xs transition-all border border-zinc-800 group-hover:border-amber-500/40"
                  >
                    View Details & Log <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800">
            <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-300 text-sm font-medium">No exercises found for {selectedMuscle}.</p>
            <p className="text-zinc-500 text-xs mt-1">Select another muscle group or view all exercises.</p>
          </div>
        )}
      </div>

      {/* Member Workout Log History */}
      {workoutLogs.length > 0 && (
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Recent Completed Workout Logs
            </h3>
            <span className="text-xs text-zinc-400">{workoutLogs.length} Entries</span>
          </div>

          <div className="space-y-2">
            {workoutLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/60 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-zinc-200">
                    {log.exercises?.name || `Exercise #${log.exercise_id}`}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {log.completed_sets} sets × {log.completed_reps} reps @ {log.weight} kg
                    {log.notes && <span className="text-zinc-500 ml-1 font-italic">- &quot;{log.notes}&quot;</span>}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-500 whitespace-nowrap">{log.completed_at.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Detail & Workout Logger Modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memberId={memberId}
        onLogSaved={handleLogSaved}
      />

      {/* Gym MVP CC-BY-4.0 Attribution Footer */}
      <div className="pt-4 border-t border-zinc-800/60 text-center">
        <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5 flex-wrap">
          <span>Inspired by & incorporating 3D Anatomy concepts from</span>
          <a
            href="https://github.com/AnderssonProgramming/gym-mvp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400/80 hover:text-amber-300 font-semibold underline inline-flex items-center gap-0.5"
          >
            Gym MVP <ExternalLink className="w-3 h-3" />
          </a>
          <span>(CC-BY-4.0 License)</span>
        </p>
      </div>
    </div>
  );
}
