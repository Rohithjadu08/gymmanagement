'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Plus, Calendar, IndianRupee, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Payment } from '@/types/database.types';
import { getPayments } from '@/lib/data-service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RecordPaymentModal } from '@/components/admin/record-payment-modal';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [search]);

  const loadPayments = async () => {
    setLoading(true);
    const data = await getPayments(search);
    setPayments(data);
    setLoading(false);
  };

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Payment Ledger & Receipts</h1>
          <p className="text-sm text-slate-400">
            Complete historical payment history. Renewals create new ledger entries without overwriting records.
          </p>
        </div>

        <Button
          onClick={() => setRecordPaymentOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record New Payment
        </Button>
      </div>

      {/* Summary KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-emerald-900/40 bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Filtered Collection</span>
            <IndianRupee className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-slate-400 mt-1">Total value across {payments.length} transactions</p>
        </Card>
      </div>

      {/* Search & Ledger Table */}
      <Card className="border-slate-800 bg-slate-900/90">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>Filtered payment ledger records</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search member, code, plan or method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No payments match your search criteria.
            </div>
          ) : (
            <>
              {/* Mobile Receipt Cards (< md) */}
              <div className="block md:hidden space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5 shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-base">{p.members?.full_name || 'Member'}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/80">
                            {p.members?.membership_number || p.members?.member_code}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">📱 {p.members?.phone}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-emerald-400">{formatCurrency(p.amount)}</div>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                          {p.payment_method}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block">Plan Name:</span>
                        <span className="font-semibold text-slate-200">{p.membership_plans?.name || 'Standard'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Payment Date:</span>
                        <span className="font-semibold text-slate-200">{formatDate(p.payment_date)}</span>
                      </div>
                      <div className="col-span-2 pt-1">
                        <span className="text-slate-400 block">Validity Period:</span>
                        <span className="font-semibold text-emerald-300">
                          {formatDate(p.start_date)} → {formatDate(p.expiry_date)}
                        </span>
                      </div>
                      {p.notes && (
                        <div className="col-span-2 text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800/60">
                          Note: {p.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Ledger Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                      <th className="pb-3">Member</th>
                      <th className="pb-3">Plan</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment Date</th>
                      <th className="pb-3">Validity Period</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30">
                        <td className="py-3.5">
                          <span className="font-semibold text-white block">
                            {p.members?.full_name || 'Member'}
                          </span>
                          <span className="text-xs font-mono text-emerald-400 font-bold">
                            {p.members?.membership_number || p.members?.member_code}
                          </span>
                          <span className="text-xs text-slate-400 block">
                            {p.members?.phone}
                          </span>
                        </td>
                        <td className="py-3.5 font-medium text-emerald-400">
                          {p.membership_plans?.name || 'Plan'}
                        </td>
                        <td className="py-3.5 font-bold text-white">{formatCurrency(p.amount)}</td>
                        <td className="py-3.5 text-slate-300">{formatDate(p.payment_date)}</td>
                        <td className="py-3.5 text-xs text-slate-300">
                          {formatDate(p.start_date)} → <span className="font-semibold text-white">{formatDate(p.expiry_date)}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs text-slate-400">{p.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        onSuccess={loadPayments}
      />
    </div>
  );
}

