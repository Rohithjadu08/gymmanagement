'use client';

import { useEffect, useState } from 'react';
import { getMemberById } from '@/lib/data-service';
import { Payment } from '@/types/database.types';
import { CreditCard, Download, FileText, CheckCircle2 } from 'lucide-react';

export default function MemberPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getMemberById('mem-1');
      if (data) {
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

  const totalSpent = payments.reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Payment Receipts & History</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete transaction ledger for your gym membership dues and renewals.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-right">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Total Paid</span>
          <span className="text-xl font-extrabold text-amber-400">₹{totalSpent.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            Transaction Receipts ({payments.length})
          </h2>
          <span className="text-xs text-zinc-500">Read-only ledger</span>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {payments.map((p) => (
            <div key={p.id} className="p-4 hover:bg-zinc-800/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{p.membership_plans?.name || 'Membership Plan'}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                      {p.payment_method}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Paid on {p.payment_date} • Validity: {p.start_date} to {p.expiry_date}
                  </p>
                  {p.notes && <p className="text-xs text-zinc-500 italic mt-0.5">Note: {p.notes}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-400 block">₹{p.amount}</span>
                  <span className="text-[10px] text-emerald-400/80 font-medium">SUCCESSFUL</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

