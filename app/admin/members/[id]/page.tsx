'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  MessageCircle,
  Plus,
  Edit2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { MemberWithDetails, Payment } from '@/types/database.types';
import { getMemberById } from '@/lib/data-service';
import { formatCurrency, formatDate, generateWhatsAppReminderUrl } from '@/lib/utils';
import { RecordPaymentModal } from '@/components/admin/record-payment-modal';
import { EditMemberModal } from '@/components/admin/edit-member-modal';

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<{
    member: MemberWithDetails;
    payments: Payment[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [editMemberOpen, setEditMemberOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadProfileData();
    }
  }, [id]);

  const loadProfileData = async () => {
    setLoading(true);
    const profile = await getMemberById(id);
    setData(profile);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4 text-center py-12">
        <h2 className="text-xl font-bold text-white">Member Not Found</h2>
        <p className="text-sm text-slate-400">The requested member ID does not exist in the database.</p>
        <Link href="/admin/members">
          <Button variant="outline">Back to Member Directory</Button>
        </Link>
      </div>
    );
  }

  const { member, payments } = data;

  const { url: waUrl } = generateWhatsAppReminderUrl({
    phone: member.phone,
    memberName: member.full_name,
    expiryDate: member.expiry_date || '',
    isOverdue: member.status === 'OVERDUE',
  });

  return (
    <div className="space-y-8">
      {/* Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/members"
          className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Member Directory
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setEditMemberOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4 text-emerald-400" />
            Edit Profile
          </Button>

          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="whatsapp">
              <MessageCircle className="mr-2 h-4 w-4" />
              Send WhatsApp Notice
            </Button>
          </a>

          <Button
            onClick={() => setRecordPaymentOpen(true)}
            variant="amber"
            className="shadow-lg shadow-amber-600/20"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Record Payment / Renew
          </Button>
        </div>
      </div>

      {/* Header Profile Card */}
      <Card className="border-slate-800 bg-slate-900/90 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-extrabold text-3xl shadow-xl ring-4 ring-emerald-500/20 overflow-hidden border border-slate-700">
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.full_name} className="h-full w-full object-cover" />
              ) : (
                member.full_name.charAt(0)
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white">{member.full_name}</h1>
                <span className="rounded-lg bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300">
                  {member.member_code}
                </span>
              </div>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-400" /> {member.phone}
                {member.email && (
                  <>
                    <span>•</span>
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {member.email}
                  </>
                )}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500" /> Joined {formatDate(member.joining_date)}
              </p>
            </div>
          </div>

          {/* Current Membership Status Widget */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 min-w-[240px] space-y-2 text-right md:text-right">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Current Membership Status
            </div>
            <div>
              <StatusBadge status={member.status} daysRemaining={member.days_remaining} className="text-sm px-3 py-1" />
            </div>
            <div className="text-xs text-slate-300 pt-1">
              Expires: <span className="font-bold text-white">{formatDate(member.expiry_date)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Details (1 Column) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-400" />
                Personal Information & Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm divide-y divide-slate-800/60">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Member ID:</span>
                <span className="font-semibold text-white">{member.member_code}</span>
              </div>
              <div className="pt-3 flex justify-between">
                <span className="text-slate-400">Phone Number:</span>
                <span className="font-semibold text-white">{member.phone}</span>
              </div>
              <div className="pt-3 flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-white">{member.email || 'N/A'}</span>
              </div>
              <div className="pt-3 flex justify-between">
                <span className="text-slate-400">Joining Date:</span>
                <span className="font-semibold text-white">{formatDate(member.joining_date)}</span>
              </div>
              <div className="pt-3 flex justify-between items-center">
                <span className="text-slate-400">Treadmill Service:</span>
                <span className={`font-bold text-xs px-2 py-0.5 rounded ${member.has_treadmill ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                  {member.has_treadmill ? 'Yes (+₹300)' : 'No'}
                </span>
              </div>
              {member.training_goals && member.training_goals.length > 0 && (
                <div className="pt-3 space-y-1.5">
                  <span className="text-slate-400 text-xs font-semibold uppercase">Training Goals / Interest:</span>
                  <div className="flex flex-wrap gap-1">
                    {member.training_goals.map((g) => (
                      <span key={g} className="text-xs bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-3 flex justify-between">
                <span className="text-slate-400">Account Status:</span>
                <span className={`font-bold ${member.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {member.is_active ? 'Active Account' : 'Inactive Account'}
                </span>
              </div>
              {member.notes && (
                <div className="pt-3 space-y-1">
                  <span className="text-slate-400 text-xs font-semibold uppercase">Notes & Special Requirements:</span>
                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {member.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment History Ledger (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                  Payment History Ledger
                </CardTitle>
                <CardDescription>
                  Complete historical record of payments, base plan fees, and treadmill add-ons
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setRecordPaymentOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Payment
              </Button>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No payment records found for this member yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                        <th className="pb-3">Payment Date</th>
                        <th className="pb-3">Plan Name</th>
                        <th className="pb-3">Fee Breakdown</th>
                        <th className="pb-3">Total Paid</th>
                        <th className="pb-3">Duration / Expiry</th>
                        <th className="pb-3">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/30">
                          <td className="py-3.5 font-medium text-white">{formatDate(p.payment_date)}</td>
                          <td className="py-3.5 text-emerald-400 font-semibold">
                            {p.membership_plans?.name || 'Membership Plan'}
                          </td>
                          <td className="py-3.5 text-xs text-slate-300">
                            Base: ₹{p.base_amount || p.amount}
                            {p.addon_amount ? <span className="text-emerald-400 ml-1">(+{p.addon_name || 'Add-on'} ₹{p.addon_amount})</span> : ''}
                          </td>
                          <td className="py-3.5 font-bold text-white">{formatCurrency(p.amount)}</td>
                          <td className="py-3.5 text-xs text-slate-300">
                            {formatDate(p.start_date)} → <span className="font-semibold text-white">{formatDate(p.expiry_date)}</span>
                          </td>
                          <td className="py-3.5">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                              {p.payment_method}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <RecordPaymentModal
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        onSuccess={loadProfileData}
        defaultMemberId={member.id}
      />

      <EditMemberModal
        open={editMemberOpen}
        onOpenChange={setEditMemberOpen}
        member={member}
        onSuccess={loadProfileData}
      />
    </div>
  );
}
