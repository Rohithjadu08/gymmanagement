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
  Search,
  ArrowRight,
  User,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/status-badge';
import { DashboardMetrics, MemberWithDetails } from '@/types/database.types';
import { getDashboardMetrics, getMembers } from '@/lib/data-service';
import { formatCurrency, formatDate, generateWhatsAppReminderUrl } from '@/lib/utils';
import { AddMemberModal } from '@/components/admin/add-member-modal';
import { RecordPaymentModal } from '@/components/admin/record-payment-modal';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [allMembers, setAllMembers] = useState<MemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<'ALL' | 'ACTIVE' | 'DUE_SOON' | 'OVERDUE'>('ALL');

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    const [data, membersData] = await Promise.all([
      getDashboardMetrics(),
      getMembers(),
    ]);
    setMetrics(data);
    setAllMembers(membersData);
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

  const filteredMembers = allMembers.filter((m) => {
    const matchesStatus = memberFilter === 'ALL' || m.status === memberFilter;
    const query = memberSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      m.full_name.toLowerCase().includes(query) ||
      (m.membership_number && m.membership_number.toLowerCase().includes(query)) ||
      m.member_code.toLowerCase().includes(query) ||
      m.phone.includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 md:space-y-8 max-w-full overflow-hidden">
      {/* Mobile & Desktop Header Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/images/shiva-gym-logo.png"
            alt="SHIVA GYM Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-800 object-contain bg-slate-900 p-0.5 shadow-md shrink-0"
          />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-2">
              SHIVA GYM <span className="text-emerald-400 text-[10px] sm:text-xs font-semibold tracking-wider border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 rounded-full uppercase">SHAPE YOUR BODY</span>
            </h1>
            <p className="text-xs text-slate-400">
              Real-time member status tracking, fee collections, and overdue alerts.
            </p>
          </div>
        </div>

        {/* Desktop Quick Action Header Buttons */}
        <div className="hidden md:flex items-center gap-3">
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

      {/* Mobile Quick Action Section (< md) */}
      <div className="block md:hidden space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-0.5">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            onClick={() => setAddMemberOpen(true)}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 rounded-xl"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add Member</span>
          </Button>

          <Button
            onClick={() => setRecordPaymentOpen(true)}
            variant="amber"
            className="w-full h-12 font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 rounded-xl"
          >
            <CreditCard className="h-4 w-4" />
            <span>₹ Record Payment</span>
          </Button>

          <Link href="/admin/reminders" className="col-span-2">
            <Button
              variant="outline"
              className="w-full h-11 border-slate-800 bg-slate-900/90 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 rounded-xl"
            >
              <BellRing className="h-4 w-4 text-emerald-400" />
              <span>🔔 Send Fee Reminders</span>
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

      {/* Shiva Gym Official Services & Info Banner */}
      <div className="rounded-2xl border border-emerald-900/50 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">OFFICIAL GYM SERVICES</span>
              <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded font-mono">BALAJI — 9600879081</span>
            </div>
            <h2 className="text-lg font-bold text-white">SHIVA GYM — Shape Your Body</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium">💪 Gym Training</span>
            <span className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium">🏋️ Personal Training</span>
            <span className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium">🏆 Body Building</span>
            <span className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium">⚙️ State-of-the-Art Equipment</span>
            <span className="bg-emerald-950 border border-emerald-800 text-emerald-300 px-3 py-1.5 rounded-lg font-bold">🏃 Treadmill (+₹300 Add-on)</span>
          </div>
        </div>
      </div>

      {/* KPI Cards (1 Card Per Row on Mobile, 2 on Tablet, 3 on Desktop) */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-0.5">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Total Members */}
          <Card className="relative overflow-hidden border-slate-800 bg-slate-900/90 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Members</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.totalMembers}</span>
              <Link href="/admin/members" className="text-xs font-semibold text-emerald-400 hover:underline">
                View directory →
              </Link>
            </div>
          </Card>

          {/* Active Members */}
          <Card className="relative overflow-hidden border-emerald-900/50 bg-emerald-950/30 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Active Members</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-900/40 text-emerald-400">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300">{metrics.activeMembers}</span>
              <span className="text-xs text-emerald-400/80 font-medium">Valid Memberships</span>
            </div>
          </Card>

          {/* Due Soon Members */}
          <Card className="relative overflow-hidden border-amber-900/50 bg-amber-950/30 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Due Soon</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-900/40 text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">{metrics.dueSoonMembers}</span>
              <Link href="/admin/reminders?tab=DUE_SOON" className="text-xs font-semibold text-amber-400 hover:underline">
                Review list →
              </Link>
            </div>
          </Card>

          {/* Overdue Members */}
          <Card className="relative overflow-hidden border-rose-900/50 bg-rose-950/30 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Overdue Members</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-900/40 text-rose-400">
                <AlertOctagon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-300">{metrics.overdueMembers}</span>
              <Link href="/admin/reminders?tab=OVERDUE" className="text-xs font-semibold text-rose-400 hover:underline">
                Send Reminders →
              </Link>
            </div>
          </Card>

          {/* Today's Collection */}
          <Card className="relative overflow-hidden border-slate-800 bg-slate-900/90 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Collection</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{formatCurrency(metrics.todayCollection)}</span>
              <span className="text-xs text-slate-400">Today's Receipts</span>
            </div>
          </Card>

          {/* Current Month Collection */}
          <Card className="relative overflow-hidden border-slate-800 bg-slate-900/90 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Month Collection</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{formatCurrency(metrics.currentMonthCollection)}</span>
              <Link href="/admin/reports" className="text-xs font-semibold text-emerald-400 hover:underline">
                View reports →
              </Link>
            </div>
          </Card>
        </div>
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
                <>
                  {/* Mobile Receipt Cards (< md) */}
                  <div className="block md:hidden space-y-3">
                    {metrics.recentPayments.map((p) => (
                      <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-white text-sm">{p.members?.full_name || 'Member'}</h4>
                            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/80">
                              {p.members?.membership_number || p.members?.member_code}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-extrabold text-emerald-400">{formatCurrency(p.amount)}</div>
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                              {p.payment_method}
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                          <span>Plan: <strong className="text-slate-200">{p.membership_plans?.name || 'Standard'}</strong></span>
                          <span>Expires: <strong className="text-slate-200">{formatDate(p.expiry_date)}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Payments Table (>= md) */}
                  <div className="hidden md:block overflow-x-auto">
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
                              <div>{p.members?.full_name || 'Member'}</div>
                              <div className="text-xs font-mono text-emerald-400 font-bold">{p.members?.membership_number || p.members?.member_code}</div>
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
                </>
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
                  const { url: waUrl, isValidPhone, disabledReason } = generateWhatsAppReminderUrl({
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
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white text-sm">{m.full_name}</h4>
                          <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">{m.membership_number || m.member_code}</span>
                        </div>
                        <p className="text-xs text-rose-400">
                          {Math.abs(m.days_remaining)} days overdue
                        </p>
                      </div>
                      {isValidPhone ? (
                        <a href={waUrl} target="_blank" rel="noopener noreferrer" title="💬 WhatsApp Reminder">
                          <Button size="sm" variant="whatsapp" className="h-8 text-xs px-2.5">
                            <MessageCircle className="mr-1 h-3.5 w-3.5" />
                            WhatsApp
                          </Button>
                        </a>
                      ) : (
                        <Button
                          size="sm"
                          variant="whatsapp"
                          disabled
                          className="h-8 text-xs px-2.5 opacity-50 cursor-not-allowed"
                          title={disabledReason || 'WhatsApp unavailable — phone number missing'}
                        >
                          <MessageCircle className="mr-1 h-3.5 w-3.5" />
                          WhatsApp
                        </Button>
                      )}
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

      {/* MEMBERS OVERVIEW SECTION */}
      <Card className="border-slate-800 bg-slate-900/90 shadow-xl p-5 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white tracking-tight">Members Overview</h2>
              <span className="rounded-full bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400">
                {metrics.totalMembers} Total Members
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Browse individual athlete profiles, photo cards, membership validity, and payment statuses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search name, number, phone..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-950 border-slate-800 focus:border-emerald-500"
              />
            </div>

            {/* View All Members Button */}
            <Link href="/admin/members">
              <Button size="sm" variant="outline" className="w-full sm:w-auto h-9 text-xs font-semibold">
                View All Members <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Pills (Horizontally Scrollable Container on Mobile) */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Filter Status</span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'ALL', label: 'All Members' },
              { id: 'ACTIVE', label: '🟢 Active' },
              { id: 'DUE_SOON', label: '🟡 Due Soon' },
              { id: 'OVERDUE', label: '🔴 Overdue' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMemberFilter(tab.id as any)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  memberFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Member Profile Cards Grid */}
        {filteredMembers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            No member profiles match your current search or status filter state.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMembers.map((member) => (
              <Link
                key={member.id}
                href={`/admin/members/${member.id}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/90 p-4 transition-all duration-200 hover:border-emerald-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-emerald-950/20"
              >
                <div className="space-y-3">
                  {/* Photo Container */}
                  <div className="relative h-44 w-full rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center group-hover:border-slate-700 transition-colors">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.full_name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 gap-1">
                        <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-2xl text-emerald-400 shadow-md">
                          {member.full_name.charAt(0)}
                        </div>
                      </div>
                    )}

                    <div className="absolute top-2 right-2">
                      <StatusBadge status={member.status} showIcon={false} className="text-[10px] px-2 py-0.5 shadow-md" />
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors truncate">
                      {member.full_name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                        {member.membership_number || member.member_code}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        📱 {member.phone ? (
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.location.href = `tel:${member.phone}`;
                            }}
                            className="hover:text-emerald-400 hover:underline cursor-pointer"
                            title="Call Member"
                          >
                            {member.phone}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Plan & Fee Breakdown */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400 font-medium">Plan:</span>
                      <span className="font-semibold text-slate-100">{member.plan_name || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400 font-medium">Fee Amount:</span>
                      <span className="font-bold text-emerald-400">₹{member.plan_price || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400 font-medium">Expires:</span>
                      <span className="font-semibold text-slate-200">{formatDate(member.expiry_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>View Member Profile</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

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
