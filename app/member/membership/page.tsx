'use client';

import { useEffect, useState } from 'react';
import { getMemberById } from '@/lib/data-service';
import { MemberWithDetails, Payment } from '@/types/database.types';
import { Award, Calendar, CheckCircle2, Clock, ShieldAlert, Sparkles, Receipt } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function MemberMembershipPage() {
  const [member, setMember] = useState<MemberWithDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getMemberById('mem-1');
      if (data) {
        setMember(data.member);
        setPayments(data.payments);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const days = member?.days_remaining ?? 0;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Membership Status & Validity</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Detailed overview of your current membership plan and renewal timeline.
        </p>
      </div>

      {/* Active Membership Hero Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 rounded-2xl border border-zinc-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  {member?.plan_name || 'Standard Plan'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Member ID: <span className="text-amber-400 font-mono">{member?.member_code}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div>
                <span className="text-xs text-zinc-500 block">Joining Date</span>
                <span className="text-sm font-semibold text-white">{member?.joining_date}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Current Expiry</span>
                <span className="text-sm font-semibold text-amber-400">
                  {member?.expiry_date ? format(parseISO(member.expiry_date), 'dd MMM yyyy') : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Validity Remaining</span>
                <span className="text-sm font-bold text-emerald-400">
                  {days > 0 ? `${days} Days` : 'Expired'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            {member?.status === 'ACTIVE' && (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                ACTIVE & VALID
              </div>
            )}
            {member?.status === 'DUE_SOON' && (
              <div className="px-4 py-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                DUE FOR RENEWAL ({days} DAYS)
              </div>
            )}
            {member?.status === 'OVERDUE' && (
              <div className="px-4 py-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                MEMBERSHIP EXPIRED
              </div>
            )}
            <p className="text-[11px] text-zinc-400 text-right">
              Renew at gym front desk or contact admin.
            </p>
          </div>
        </div>
      </div>

      {/* History Ledger */}
      <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-amber-400" />
          Membership Payment Cycles
        </h3>

        <div className="space-y-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/20">
                  ₹
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {p.membership_plans?.name || 'Membership Renewal'}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Valid from {p.start_date} to {p.expiry_date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:text-right justify-between sm:justify-end">
                <div>
                  <span className="text-sm font-bold text-emerald-400 block">₹{p.amount}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">{p.payment_method}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-medium">
                  {p.payment_date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
