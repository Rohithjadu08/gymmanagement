'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BellRing, Clock, AlertOctagon, MessageCircle, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { MemberWithDetails } from '@/types/database.types';
import { getMembers, getGymSettings } from '@/lib/data-service';
import { formatDate, generateWhatsAppReminderUrl } from '@/lib/utils';
import { RecordPaymentModal } from '@/components/admin/record-payment-modal';

function RemindersContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'OVERDUE';

  const [activeTab, setActiveTab] = useState<'OVERDUE' | 'DUE_SOON'>(
    initialTab === 'DUE_SOON' ? 'DUE_SOON' : 'OVERDUE'
  );
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [gymName, setGymName] = useState('Iron Pulse Gym');

  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    const settings = await getGymSettings();
    setGymName(settings.gym_name);

    const allMembers = await getMembers(undefined, activeTab);
    setMembers(allMembers);
    setLoading(false);
  };

  const handleSendWhatsApp = (member: MemberWithDetails) => {
    const isOverdue = member.status === 'OVERDUE';
    const { url } = generateWhatsAppReminderUrl({
      phone: member.phone,
      memberName: member.full_name,
      expiryDate: member.expiry_date || '',
      isOverdue,
      gymName,
    });

    window.open(url, '_blank');
  };

  const handleOpenPayment = (memberId: string) => {
    setSelectedMemberId(memberId);
    setRecordPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Fee Reminders & Overdue Alerts</h1>
          <p className="text-sm text-slate-400">
            Track overdue membership fees and send instant WhatsApp reminders.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1">
          <button
            onClick={() => setActiveTab('OVERDUE')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'OVERDUE'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertOctagon className="h-4 w-4" />
            Overdue Memberships
          </button>

          <button
            onClick={() => setActiveTab('DUE_SOON')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'DUE_SOON'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            Upcoming Expiry (Next 7 Days)
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="border-slate-800 bg-slate-900/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellRing className="h-5 w-5 text-emerald-400" />
            {activeTab === 'OVERDUE' ? 'Overdue Members List' : 'Upcoming Expiry List'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'OVERDUE'
              ? 'Members whose membership fee is past due. Click Send WhatsApp to dispatch overdue notice.'
              : 'Members whose membership expires within 7 days. Remind them to renew early.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : members.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No members match the current filter state.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                    <th className="pb-3">Member</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Fee Amount</th>
                    <th className="pb-3">Expiry Date</th>
                    <th className="pb-3">Days Overdue / Remaining</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30">
                      <td className="py-3.5">
                        <span className="font-bold text-white block">{m.full_name}</span>
                        <span className="text-xs text-slate-400">{m.member_code}</span>
                      </td>
                      <td className="py-3.5 text-slate-300 font-mono">{m.phone}</td>
                      <td className="py-3.5 text-emerald-400 font-semibold">{m.plan_name || 'N/A'}</td>
                      <td className="py-3.5 font-bold text-white">₹{m.plan_price || 0}</td>
                      <td className="py-3.5 text-slate-200">{formatDate(m.expiry_date)}</td>
                      <td className="py-3.5 font-bold">
                        {m.days_remaining >= 0 ? (
                          <span className="text-amber-400">{m.days_remaining} days left</span>
                        ) : (
                          <span className="text-rose-400">{Math.abs(m.days_remaining)} days overdue</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <StatusBadge status={m.status} showIcon={false} />
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="amber"
                            onClick={() => handleOpenPayment(m.id)}
                            className="h-8 text-xs"
                          >
                            <CreditCard className="mr-1 h-3.5 w-3.5" />
                            Record Fee
                          </Button>

                          <Button
                            size="sm"
                            variant="whatsapp"
                            onClick={() => handleSendWhatsApp(m)}
                            className="h-8 text-xs"
                          >
                            <MessageCircle className="mr-1 h-3.5 w-3.5" />
                            WhatsApp
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        onSuccess={loadData}
        defaultMemberId={selectedMemberId}
      />
    </div>
  );
}

export default function RemindersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-36 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <RemindersContent />
    </Suspense>
  );
}
