'use client';

import React, { useState } from 'react';
import { Exercise, WorkoutLog } from '@/types/database.types';
import { logWorkoutProgress } from '@/lib/data-service';
import {
  X,
  Dumbbell,
  Target,
  Flame,
  Clock,
  CheckCircle2,
  ListOrdered,
  Award,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  memberId?: string;
  onLogSaved?: (log: WorkoutLog) => void;
}

export function ExerciseDetailModal({
  exercise,
  isOpen,
  onClose,
  memberId = 'mem-1',
  onLogSaved,
}: ExerciseDetailModalProps) {
  const [completedSets, setCompletedSets] = useState<number>(3);
  const [completedReps, setCompletedReps] = useState<number>(10);
  const [weightKg, setWeightKg] = useState<number>(20);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!exercise) return null;

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newLog = await logWorkoutProgress({
        member_id: memberId,
        exercise_id: exercise.id,
        completed_sets: Number(completedSets),
        completed_reps: Number(completedReps),
        weight: Number(weightKg),
        notes: notes || null,
      });

      setSaveSuccess(true);
      if (onLogSaved) {
        onLogSaved(newLog);
      }
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to log workout progress:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Beginner</Badge>;
      case 'Intermediate':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Intermediate</Badge>;
      case 'Advanced':
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">Advanced</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div className="sm:max-w-[650px] bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header Banner */}
        <div className="relative h-48 w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 overflow-hidden flex items-end p-6">
          {exercise.image_url && (
            <img
              src={exercise.image_url}
              alt={exercise.name}
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 rounded-full p-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-700/60"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/40 font-semibold px-2.5 py-0.5 text-xs">
                <Target className="w-3 h-3 mr-1" /> {exercise.muscle_group}
              </Badge>
              {getDifficultyBadge(exercise.difficulty)}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{exercise.name}</h2>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Equipment</p>
                <p className="text-xs font-medium text-zinc-200 truncate">{exercise.equipment}</p>
              </div>
            </div>

            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Primary Target</p>
                <p className="text-xs font-medium text-amber-300">{exercise.muscle_group}</p>
              </div>
            </div>

            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Secondary</p>
                <p className="text-xs font-medium text-zinc-300 truncate">
                  {exercise.secondary_muscles && exercise.secondary_muscles.length > 0
                    ? exercise.secondary_muscles.join(', ')
                    : 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" /> Overview
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80">
              {exercise.description}
            </p>
          </div>

          {/* Execution Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-amber-400" /> Proper Execution Technique
              </h4>
              <ol className="space-y-2">
                {exercise.instructions.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60 text-xs text-zinc-300"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-snug mt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Quick Workout Log Box */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-4.5 rounded-xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Log Today&apos;s Performance
              </h4>
              <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-[10px]">
                Member Progress Tracker
              </Badge>
            </div>

            {saveSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-emerald-300">Workout Logged Successfully!</p>
                <p className="text-xs text-emerald-400/80">Updating your member activity log...</p>
              </div>
            ) : (
              <form onSubmit={handleLogWorkout} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="completedSets" className="text-[11px] text-zinc-400">
                      Sets Done
                    </Label>
                    <Input
                      id="completedSets"
                      type="number"
                      min="1"
                      max="20"
                      value={completedSets}
                      onChange={(e) => setCompletedSets(Number(e.target.value))}
                      className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="completedReps" className="text-[11px] text-zinc-400">
                      Reps / Set
                    </Label>
                    <Input
                      id="completedReps"
                      type="number"
                      min="1"
                      max="100"
                      value={completedReps}
                      onChange={(e) => setCompletedReps(Number(e.target.value))}
                      className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="weightKg" className="text-[11px] text-zinc-400">
                      Weight (kg)
                    </Label>
                    <Input
                      id="weightKg"
                      type="number"
                      min="0"
                      max="500"
                      step="0.5"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-[11px] text-zinc-400">
                    Notes / Form Feeling (Optional)
                  </Label>
                  <Input
                    id="notes"
                    type="text"
                    placeholder="e.g. Felt great, added 2.5kg on last set"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-600"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs py-2 rounded-xl transition-colors shadow-lg shadow-amber-500/10"
                >
                  {isSubmitting ? (
                    'Saving Progress...'
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Save Workout Log
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
