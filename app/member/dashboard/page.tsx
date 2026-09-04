'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Dumbbell,
  Flame,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  User,
} from 'lucide-react';
import { getMemberById, getWorkoutsForMember, getWorkoutLogsForMember } from '@/lib/data-service';
import { MemberWithDetails, Payment, WorkoutWithDetails, WorkoutLog } from '@/types/database.types';
import { format, differenceInDays, parseISO } from 'date-fns';

export default function MemberDashboardPage() {
  const [member, setMember] = useState<MemberWithDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Default to demo member mem-1 if no active auth session found
      const data = await getMemberById('mem-1');
      if (data) {
        setMember(data.member);
        setPayments(data.payments);
      }

      const assignedWorkouts = await getWorkoutsForMember('mem-1');
      setWorkouts(assignedWorkouts);

      const recentLogs = await getWorkoutLogsForMember('mem-1');
      setLogs(recentLogs);

      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm font-medium">Loading your fitness portal...</p>
        </div>
      </div>
    );
  }

  const latestPayment = payments[0] || null;
  const daysRemaining = member?.days_remaining ?? 0;
  const todayWorkout = workouts[0] || null;

  const getStatusBadge = () => {
    if (member?.status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          ACTIVE MEMBERSHIP
        </span>
      );
    }
    if (member?.status === 'DUE_SOON') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          DUE SOON ({daysRemaining} days left)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <ShieldAlert className="w-3.5 h-3.5" />
        MEMBERSHIP EXPIRED
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 p-6 md:p-8 border border-zinc-800 shadow-xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl font-bold shadow-inner">
              {member?.full_name?.charAt(0) || 'M'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Welcome back, {member?.full_name || 'Member'}!
                </h1>
              </div>
              <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
                <span>ID: {member?.member_code}</span>
                <span>•</span>
                <span>Member since {member?.joining_date}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {getStatusBadge()}
            <Link
              href="/member/fitness"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm transition shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Explore 3D Muscle Map
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Membership Status */}
        <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Membership Expiry
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white">
              {member?.expiry_date ? format(parseISO(member.expiry_date), 'dd MMM yyyy') : 'N/A'}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {daysRemaining > 0
                ? `${daysRemaining} days remaining in current cycle`
                : 'Membership expired. Please renew.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Plan: {member?.plan_name || 'Standard'}</span>
            <Link href="/member/membership" className="text-amber-400 hover:underline flex items-center gap-1 font-medium">
              Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Today's Workout */}
        <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Assigned Routine
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white truncate">
              {todayWorkout ? todayWorkout.name : 'No Workout Assigned'}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {todayWorkout
                ? `${todayWorkout.workout_exercises?.length || 0} exercises prescribed for today`
                : 'Contact trainer for custom assignment'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Target: Upper Body / Push</span>
            <Link href="/member/workouts" className="text-amber-400 hover:underline flex items-center gap-1 font-medium">
              Start Workout <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Recent Activity */}
        <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Logged Workouts
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white">
              {logs.length} Completed
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {logs.length > 0 ? 'Consistent progress logged this month' : 'No workout logs recorded yet'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Streak: Active</span>
            <Link href="/member/workouts" className="text-amber-400 hover:underline flex items-center gap-1 font-medium">
              Log Exercise <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Detailed Workout Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-amber-400" />
                  Today's Prescribed Routine
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Follow the trainer instructions below
                </p>
              </div>
              <Link
                href="/member/workouts"
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition flex items-center gap-1.5"
              >
                Track Workout <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todayWorkout && todayWorkout.workout_exercises?.length ? (
              <div className="space-y-3">
                {todayWorkout.workout_exercises.map((we, index) => (
                  <div
                    key={we.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-sm flex items-center justify-center shrink-0 border border-amber-500/20">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {we.exercises?.name || 'Exercise'}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Muscle: <span className="text-zinc-300 font-medium">{we.exercises?.muscle_group}</span> • Equipment: {we.exercises?.equipment}
                        </p>
                        {we.notes && (
                          <p className="text-xs text-amber-400/90 italic mt-1">
                            Note: "{we.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs">
                      <div className="text-center">
                        <span className="text-zinc-400 block text-[10px] uppercase">Sets</span>
                        <span className="font-bold text-amber-400">{we.sets}</span>
                      </div>
                      <div className="w-px h-6 bg-zinc-800" />
                      <div className="text-center">
                        <span className="text-zinc-400 block text-[10px] uppercase">Reps</span>
                        <span className="font-bold text-white">{we.reps}</span>
                      </div>
                      <div className="w-px h-6 bg-zinc-800" />
                      <div className="text-center">
                        <span className="text-zinc-400 block text-[10px] uppercase">Rest</span>
                        <span className="font-bold text-zinc-300">{we.rest_seconds}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800">
                <p className="text-zinc-400 text-sm">No workout routine assigned for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Membership Summary & Quick Links */}
        <div className="space-y-6">
          {/* Quick Payment & Membership Summary */}
          <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              Latest Payment Receipt
            </h2>

            {latestPayment ? (
              <div className="space-y-3 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Plan</span>
                  <span className="font-medium text-white">{latestPayment.membership_plans?.name || 'Standard'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Amount Paid</span>
                  <span className="font-bold text-emerald-400">₹{latestPayment.amount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Payment Date</span>
                  <span className="text-zinc-300">{latestPayment.payment_date}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Valid Until</span>
                  <span className="text-amber-400 font-semibold">{latestPayment.expiry_date}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Method</span>
                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono text-[10px]">
                    {latestPayment.payment_method}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">No payments recorded.</p>
            )}

            <div className="mt-4 pt-3 border-t border-zinc-800">
              <Link
                href="/member/payments"
                className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition flex items-center justify-center gap-2"
              >
                View Full Payment Ledger
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Fitness Portal Quick Actions */}
          <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-6 shadow-lg space-y-3">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Member Quick Navigation
            </h2>

            <Link
              href="/member/fitness"
              className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-bold">Interactive 3D Muscle Map</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/member/profile"
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-white transition"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-medium">My Profile & Contact Info</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>

            <Link
              href="/member/membership"
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-white transition"
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-medium">Membership Status & Validity</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
