'use client';

import { useEffect, useState } from 'react';
import { getWorkoutsForMember, getWorkoutLogsForMember, logWorkoutProgress } from '@/lib/data-service';
import { WorkoutWithDetails, WorkoutLog, WorkoutExercise } from '@/types/database.types';
import { Dumbbell, Check, Flame, Clock, Play, History, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function MemberWorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Active workout execution tracking state
  const [activeExercise, setActiveExercise] = useState<WorkoutExercise | null>(null);
  const [completedSets, setCompletedSets] = useState(3);
  const [completedReps, setCompletedReps] = useState(10);
  const [weightKg, setWeightKg] = useState(50);
  const [logNotes, setLogNotes] = useState('');
  const [logging, setLogging] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    async function loadData() {
      const assigned = await getWorkoutsForMember('mem-1');
      setWorkouts(assigned);

      const history = await getWorkoutLogsForMember('mem-1');
      setLogs(history);

      if (assigned.length > 0 && assigned[0].workout_exercises?.length) {
        const firstEx = assigned[0].workout_exercises[0];
        setActiveExercise(firstEx);
        setCompletedSets(firstEx.sets);
        setCompletedReps(firstEx.reps);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const handleSelectExercise = (we: WorkoutExercise) => {
    setActiveExercise(we);
    setCompletedSets(we.sets);
    setCompletedReps(we.reps);
  };

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExercise) return;

    setLogging(true);
    setSuccessToast('');

    try {
      const newLog = await logWorkoutProgress({
        member_id: 'mem-1',
        workout_id: activeExercise.workout_id,
        exercise_id: activeExercise.exercise_id,
        completed_sets: completedSets,
        completed_reps: completedReps,
        weight: weightKg,
        duration_seconds: 600,
        notes: logNotes || 'Great set!',
      });

      setLogs((prev) => [newLog, ...prev]);
      setSuccessToast(`Logged ${activeExercise.exercises?.name}! 💪`);
      setLogNotes('');
      setTimeout(() => setSuccessToast(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeWorkout = workouts[0] || null;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Workouts & Progress Tracker</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Follow your trainer's assigned routine and record your reps, sets, and weights.
        </p>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-sm font-bold flex items-center gap-2 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          {successToast}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Workout & Exercise List */}
        <div className="space-y-4">
          <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-amber-400" />
                Prescribed Routine
              </h2>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {activeWorkout?.status || 'ASSIGNED'}
              </span>
            </div>

            {activeWorkout ? (
              <div>
                <h3 className="text-lg font-extrabold text-white">{activeWorkout.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{activeWorkout.description}</p>
                <p className="text-[11px] text-zinc-500 mt-2">Assigned on: {activeWorkout.assigned_date}</p>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">No workout assigned yet.</p>
            )}
          </div>

          {/* Exercise Selection List */}
          <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-4 shadow-lg space-y-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-2">
              Routine Exercises ({activeWorkout?.workout_exercises?.length || 0})
            </h3>

            {activeWorkout?.workout_exercises?.map((we, index) => {
              const isSelected = activeExercise?.id === we.id;
              return (
                <button
                  key={we.id}
                  onClick={() => handleSelectExercise(we)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/40 text-white'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                        isSelected
                          ? 'bg-amber-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{we.exercises?.name}</h4>
                      <p className="text-[11px] text-zinc-400">
                        {we.sets} sets x {we.reps} reps • {we.rest_seconds}s rest
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-zinc-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Center/Right Column: Interactive Exercise Tracker & Logger */}
        <div className="lg:col-span-2 space-y-6">
          {activeExercise ? (
            <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-6 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    {activeExercise.exercises?.muscle_group} Focus
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-0.5">
                    {activeExercise.exercises?.name}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Equipment: <span className="text-zinc-300 font-medium">{activeExercise.exercises?.equipment}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Target Sets</span>
                    <span className="font-extrabold text-amber-400 text-base">{activeExercise.sets}</span>
                  </div>
                  <div className="w-px h-8 bg-zinc-800" />
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Target Reps</span>
                    <span className="font-extrabold text-white text-base">{activeExercise.reps}</span>
                  </div>
                  <div className="w-px h-8 bg-zinc-800" />
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Rest</span>
                    <span className="font-extrabold text-zinc-300 text-base">{activeExercise.rest_seconds}s</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {activeExercise.exercises?.instructions && (
                <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Execution Steps:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
                    {activeExercise.exercises.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Form to Log Set & Performance */}
              <form onSubmit={handleLogProgress} className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Record Your Set Performance
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Sets Completed</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={completedSets}
                      onChange={(e) => setCompletedSets(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-bold text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Reps Achieved</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={completedReps}
                      onChange={(e) => setCompletedReps(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-bold text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Weight Lifted (KG)</label>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      step={2.5}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-bold text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Set Notes / Effort Level</label>
                  <input
                    type="text"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="e.g. Felt light, pushed 2 extra reps"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={logging}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    {logging ? (
                      <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Log Set & Save Progress
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center bg-zinc-900/90 rounded-xl border border-zinc-800">
              <p className="text-zinc-400 text-sm">Select an exercise from your routine to begin logging.</p>
            </div>
          )}

          {/* Workout Activity History */}
          <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-6 shadow-lg">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              Logged Set History ({logs.length})
            </h3>

            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{log.exercises?.name}</h4>
                      <p className="text-xs text-zinc-400">
                        {log.completed_sets} sets x {log.completed_reps} reps @ <span className="text-amber-400 font-bold">{log.weight}kg</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-zinc-500 block">{log.completed_at}</span>
                    {log.notes && <span className="text-[11px] text-zinc-400 italic">"{log.notes}"</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

