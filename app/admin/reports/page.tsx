'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, IndianRupee, PieChart as PieChartIcon, AlertOctagon, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DashboardMetrics, Payment } from '@/types/database.types';
import { getDashboardMetrics, getPayments } from '@/lib/data-service';
import { formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    const m = await getDashboardMetrics();
    const p = await getPayments();
    setMetrics(m);
    setPayments(p);
    setLoading(false);
  };

  if (loading || !metrics) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const distributionData = [
    { name: 'Active', value: metrics.activeMembers },
    { name: 'Due Soon', value: metrics.dueSoonMembers },
    { name: 'Overdue', value: metrics.overdueMembers },
  ];

  const methodMap: Record<string, number> = {};
  payments.forEach((p) => {
    methodMap[p.payment_method] = (methodMap[p.payment_method] || 0) + Number(p.amount);
  });

  const methodData = Object.entries(methodMap).map(([name, value]) => ({
    name,
    amount: value,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Fee Collection & Overdue Reports</h1>
        <p className="text-sm text-slate-400">
          Financial collection statistics, total collected revenue, and overdue fee balances.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-slate-800 bg-slate-900/90">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Collection</span>
          <p className="mt-2 text-2xl font-extrabold text-white">{formatCurrency(metrics.todayCollection)}</p>
        </Card>

        <Card className="border-emerald-900/40 bg-emerald-950/20">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Monthly Collection</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-300">{formatCurrency(metrics.currentMonthCollection)}</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/90">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue Collected</span>
          <p className="mt-2 text-2xl font-extrabold text-white">{formatCurrency(metrics.totalCollected)}</p>
        </Card>

        <Card className="border-rose-900/40 bg-rose-950/20">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Estimated Overdue Fees</span>
          <p className="mt-2 text-2xl font-extrabold text-rose-300">{formatCurrency(metrics.overdueAmount)}</p>
        </Card>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods Breakdown Chart */}
        <Card className="border-slate-800 bg-slate-900/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Collections by Payment Method
            </CardTitle>
            <CardDescription>Revenue split across Cash, UPI, and Card transactions</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={methodData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Member Status Distribution Chart */}
        <Card className="border-slate-800 bg-slate-900/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-emerald-400" />
              Membership Fee Distribution
            </CardTitle>
            <CardDescription>Active vs Due Soon vs Overdue ratio</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
