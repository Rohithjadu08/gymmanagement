'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Clock,
  AlertOctagon,
  IndianRupee,
  UserPlus,
  CreditCard,
  BellRing,
  ArrowUpRight,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DashboardMetrics } from '@/types/database.types';
import { getDashboardMetrics } from '@/lib/data-service';
import { formatCurrency, formatDate, generateWhatsAppReminderUrl } from '@/lib/utils';
import { AddMemberModal } from '@/components/admin/add-member-modal';
import { RecordPaymentModal } from '@/components/admin/record-payment-modal';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    const data = await getDashboardMetrics();
    setMetrics(data);
    setLoading(false);
  };

  if (loading || !metrics) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-400">Loading Gym Dashboard Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Gym Dashboard</h1>
          <p className="text-sm text-slate-400">
            Real-time member status tracking, fee collections, and overdue alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setAddMemberOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>

          <Button
            onClick={() => setRecordPaymentOpen(true)}
            variant="amber"
            className="shadow-lg shadow-amber-600/20"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Record Payment
          </Button>

          <Link href="/admin/reminders">
            <Button variant="outline">
              <BellRing className="mr-2 h-4 w-4 text-emerald-400" />
              Fee Reminders
            </Button>
          </Link>
        </div>
      </div>

      {/* Warning Banners */}
      {(metrics.dueSoonMembers > 0 || metrics.overdueMembers > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.dueSoonMembers > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-200">
                    {metrics.dueSoonMembers} Memberships Expiring Soon
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    Require renewal within 7 days.
                  </p>
                </div>
              </div>
              <Link href="/admin/reminders?tab=DUE_SOON">
                <Button size="sm" variant="amber">
                  View Expiring Soon
                </Button>
              </Link>
            </div>
          )}

          {metrics.overdueMembers > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-rose-200">
                    {metrics.overdueMembers} Overdue Memberships
                  </h3>
                  <p className="text-xs text-rose-300/80">
                    Overdue fees require immediate WhatsApp reminders.
                  </p>
                </div>
              </div>
              <Link href="/admin/reminders?tab=OVERDUE">
                <Button size="sm" variant="destructive">
                  View Overdue
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards (6 Core Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Members */}
        <Card className="relative overflow-hidden border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Members</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{metrics.totalMembers}</span>
            <Link href="/admin/members" className="text-xs font-semibold text-emerald-400 hover:underline">
              View directory →
            </Link>
          </div>
        </Card>

        {/* Active Members */}
        <Card className="relative overflow-hidden border-emerald-900/50 bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Active Members</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-900/40 text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-300">{metrics.activeMembers}</span>
            <span className="text-xs text-emerald-400/80 font-medium">Valid Memberships</span>
          </div>
        </Card>

        {/* Due Soon Members */}
        <Card className="relative overflow-hidden border-amber-900/50 bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Due Soon</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-900/40 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-300">{metrics.dueSoonMembers}</span>
            <Link href="/admin/reminders?tab=DUE_SOON" className="text-xs font-semibold text-amber-400 hover:underline">
              Review list →
            </Link>
          </div>
        </Card>

        {/* Overdue Members */}
        <Card className="relative overflow-hidden border-rose-900/50 bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Overdue Members</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-900/40 text-rose-400">
              <AlertOctagon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-300">{metrics.overdueMembers}</span>
            <Link href="/admin/reminders?tab=OVERDUE" className="text-xs font-semibold text-rose-400 hover:underline">
              Send Reminders →
            </Link>
          </div>
        </Card>

        {/* Today's Collection */}
        <Card className="relative overflow-hidden border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Collection</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{formatCurrency(metrics.todayCollection)}</span>
            <span className="text-xs text-slate-400">Today's Receipts</span>
          </div>
        </Card>

        {/* Current Month Collection */}
        <Card className="relative overflow-hidden border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Month Collection</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400">{formatCurrency(metrics.currentMonthCollection)}</span>
            <Link href="/admin/reports" className="text-xs font-semibold text-emerald-400 hover:underline">
              View reports →
            </Link>
          </div>
        </Card>
      </div>

      {/* Main Content Grid: Recent Payments & Overdue Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Payments Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Payment History</CardTitle>
                <CardDescription>Latest fee receipts & renewals</CardDescription>
              </div>
              <Link href="/admin/payments">
                <Button size="sm" variant="outline">
                  View All Payments <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {metrics.recentPayments.length === 0 ? (
                <p className="text-center py-6 text-sm text-slate-500">No payment records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                        <th className="pb-3">Member</th>
                        <th className="pb-3">Plan</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Method</th>
                        <th className="pb-3">Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {metrics.recentPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/30">
                          <td className="py-3 font-semibold text-white">
                            {p.members?.full_name || 'Member'}
                          </td>
                          <td className="py-3 text-slate-300">{p.membership_plans?.name || 'Plan'}</td>
                          <td className="py-3 font-bold text-emerald-400">{formatCurrency(p.amount)}</td>
                          <td className="py-3">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                              {p.payment_method}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">{formatDate(p.expiry_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Overdue Quick Notice Panel */}
        <div className="space-y-4">
          <Card className="border-rose-900/40 bg-slate-900/90">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-rose-300 text-base">Overdue Action Needed</CardTitle>
                <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-400">
                  {metrics.overdueMembersList.length}
                </span>
              </div>
              <CardDescription>Members requiring immediate fee renewal notices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.overdueMembersList.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  All member fees are currently up to date!
                </div>
              ) : (
                metrics.overdueMembersList.map((m) => {
                  const { url } = generateWhatsAppReminderUrl({
                    phone: m.phone,
                    memberName: m.full_name,
                    expiryDate: m.expiry_date || '',
                    isOverdue: true,
                  });

                  return (
                    <div
                      key={m.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between gap-2"
                    >
                      <div>
                        <h4 className="font-semibold text-white text-sm">{m.full_name}</h4>
                        <p className="text-xs text-rose-400">
                          {Math.abs(m.days_remaining)} days overdue
                        </p>
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="whatsapp" className="h-8 text-xs px-2.5">
                          <MessageCircle className="mr-1 h-3.5 w-3.5" />
                          WhatsApp
                        </Button>
                      </a>
                    </div>
                  );
                })
              )}

              <div className="pt-2 text-center">
                <Link
                  href="/admin/reminders?tab=OVERDUE"
                  className="text-xs font-semibold text-rose-400 hover:underline"
                >
                  View full overdue list →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Action Modals */}
      <AddMemberModal
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        onSuccess={loadMetrics}
      />

      <RecordPaymentModal
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        onSuccess={loadMetrics}
      />
    </div>
  );
}
