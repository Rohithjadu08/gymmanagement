'use client';

import { useEffect, useState } from 'react';
import { getMembers, getExercises, createWorkoutAssignment, getWorkoutsForMember } from '@/lib/data-service';
import { MemberWithDetails, Exercise, WorkoutWithDetails } from '@/types/database.types';
import { Dumbbell, Plus, Trash2, CheckCircle2, User, Sparkles, Clock, Save } from 'lucide-react';
import { format } from 'date-fns';

interface ExerciseSelection {
  exercise_id: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  notes: string;
}

export default function AdminWorkoutsPage() {
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [exercisesLibrary, setExercisesLibrary] = useState<Exercise[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('mem-1');
  const [assignedWorkouts, setAssignedWorkouts] = useState<WorkoutWithDetails[]>([]);

  // Routine Form state
  const [routineName, setRoutineName] = useState('Push Day - Hypertrophy');
  const [routineDesc, setRoutineDesc] = useState('Build chest, shoulder, and tricep mass.');
  const [selectedExercises, setSelectedExercises] = useState<ExerciseSelection[]>([
    { exercise_id: 'ex-1', sets: 4, reps: 10, rest_seconds: 90, notes: 'Work up to heavy working set' },
    { exercise_id: 'ex-2', sets: 3, reps: 12, rest_seconds: 60, notes: 'Control negative motion' },
  ]);

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initData() {
      const allMembers = await getMembers();
      setMembers(allMembers);
      if (allMembers.length > 0) {
        setSelectedMemberId(allMembers[0].id);
      }

      const library = await getExercises();
      setExercisesLibrary(library);

      setLoading(false);
    }
    initData();
  }, []);

  useEffect(() => {
    async function loadMemberWorkouts() {
      if (!selectedMemberId) return;
      const w = await getWorkoutsForMember(selectedMemberId);
      setAssignedWorkouts(w);
    }
    loadMemberWorkouts();
  }, [selectedMemberId]);

  const handleAddExerciseRow = () => {
    if (exercisesLibrary.length === 0) return;
    setSelectedExercises((prev) => [
      ...prev,
      {
        exercise_id: exercisesLibrary[0].id,
        sets: 3,
        reps: 10,
        rest_seconds: 60,
        notes: '',
      },
    ]);
  };

  const handleRemoveExerciseRow = (index: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateExerciseRow = (index: number, field: keyof ExerciseSelection, value: any) => {
    setSelectedExercises((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAssignRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || selectedExercises.length === 0) return;

    setSaving(true);
    setToastMsg('');

    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const newAssignment = await createWorkoutAssignment(
        {
          member_id: selectedMemberId,
          name: routineName,
          description: routineDesc,
          assigned_by: 'Admin Staff',
          assigned_date: todayStr,
          status: 'ASSIGNED',
        },
        selectedExercises
      );

      setAssignedWorkouts((prev) => [newAssignment, ...prev]);
      setToastMsg('Workout routine successfully assigned to member!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Assign Member Workout Routines</h1>
        <p className="text-slate-400 text-xs mt-1">
          Create custom workout programs and prescribe sets/reps for individual gym members.
        </p>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Member Selector & Existing Assignments */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Gym Member
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-sm focus:outline-none focus:border-emerald-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_code})
                </option>
              ))}
            </select>

            {selectedMember && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <p className="text-slate-300 font-bold">{selectedMember.full_name}</p>
                <p className="text-slate-400">Phone: {selectedMember.phone}</p>
                <p className="text-emerald-400 font-semibold">Status: {selectedMember.status}</p>
              </div>
            )}
          </div>

          {/* Assigned Routines List */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assigned Programs ({assignedWorkouts.length})
            </h3>

            {assignedWorkouts.map((w) => (
              <div key={w.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{w.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    {w.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{w.description}</p>
                <p className="text-[10px] text-slate-500">
                  {w.workout_exercises?.length || 0} exercises prescribed on {w.assigned_date}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Routine Builder Form */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-xl border border-slate-800 p-6 shadow-lg space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            Routine Builder Form
          </h2>

          <form onSubmit={handleAssignRoutine} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Routine Name</label>
                <input
                  type="text"
                  required
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="e.g. Upper Body Push"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Target Goal</label>
                <input
                  type="text"
                  value={routineDesc}
                  onChange={(e) => setRoutineDesc(e.target.value)}
                  placeholder="e.g. Chest hypertrophy & tricep strength"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Exercises List Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Prescribed Exercises ({selectedExercises.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddExerciseRow}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Exercise
                </button>
              </div>

              {selectedExercises.map((row, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>

                    <select
                      value={row.exercise_id}
                      onChange={(e) => handleUpdateExerciseRow(idx, 'exercise_id', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    >
                      {exercisesLibrary.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.muscle_group})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveExerciseRow(idx)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Sets</label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={row.sets}
                        onChange={(e) => handleUpdateExerciseRow(idx, 'sets', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Reps</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={row.reps}
                        onChange={(e) => handleUpdateExerciseRow(idx, 'reps', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rest (Sec)</label>
                      <input
                        type="number"
                        min={0}
                        max={300}
                        step={15}
                        value={row.rest_seconds}
                        onChange={(e) => handleUpdateExerciseRow(idx, 'rest_seconds', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trainer Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Focus on tempo"
                        value={row.notes}
                        onChange={(e) => handleUpdateExerciseRow(idx, 'notes', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving || selectedExercises.length === 0}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Assign Routine to Member
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

