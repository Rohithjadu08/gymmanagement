'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MemberWithDetails, MembershipPlan, PaymentMethod } from '@/types/database.types';
import { getMembers, getMembershipPlans, recordPayment } from '@/lib/data-service';
import { SHIVA_GYM_CONFIG } from '@/lib/gym-config';
import { format, addMonths, parseISO } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultMemberId?: string;
}

export function RecordPaymentModal({
  open,
  onOpenChange,
  onSuccess,
  defaultMemberId,
}: RecordPaymentModalProps) {
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState(defaultMemberId || '');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [hasTreadmill, setHasTreadmill] = useState(false);
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expiryDate, setExpiryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      loadDropdownData();
    }
  }, [open]);

  useEffect(() => {
    if (defaultMemberId) {
      setSelectedMemberId(defaultMemberId);
    }
  }, [defaultMemberId]);

  const loadDropdownData = async () => {
    const fetchedMembers = await getMembers();
    const fetchedPlans = await getMembershipPlans();
    setMembers(fetchedMembers);
    setPlans(fetchedPlans);

    if (fetchedPlans.length > 0) {
      const validPlan = fetchedPlans.find((p) => p.id === selectedPlanId);
      if (!validPlan) {
        handlePlanChange(fetchedPlans[0].id, fetchedPlans);
      }
    }
  };

  const calculateExpiry = (plan: MembershipPlan, startStr: string) => {
    try {
      const start = parseISO(startStr);
      let monthsToAdd = 1;
      if (plan.name.includes('15')) monthsToAdd = 15;
      else if (plan.name.includes('6')) monthsToAdd = 6;
      else if (plan.name.includes('4')) monthsToAdd = 4;
      else if (plan.name.includes('2')) monthsToAdd = 2;
      else if (plan.name.includes('1')) monthsToAdd = 1;
      else monthsToAdd = Math.round(plan.duration_days / 30);

      const expiry = addMonths(start, monthsToAdd);
      return format(expiry, 'yyyy-MM-dd');
    } catch {
      return startStr;
    }
  };

  const handlePlanChange = (planId: string, availablePlans = plans) => {
    setSelectedPlanId(planId);
    const plan = availablePlans.find((p) => p.id === planId);
    if (plan) {
      setBaseAmount(Number(plan.price));
      setExpiryDate(calculateExpiry(plan, startDate));
    }
  };

  const handleStartDateChange = (newStartDateStr: string) => {
    setStartDate(newStartDateStr);
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (plan && newStartDateStr) {
      setExpiryDate(calculateExpiry(plan, newStartDateStr));
    }
  };

  const addonAmount = hasTreadmill ? SHIVA_GYM_CONFIG.treadmill_addon.price : 0;
  const totalAmount = baseAmount + addonAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedPlanId || !expiryDate) {
      alert('Please complete all required payment details');
      return;
    }

    setLoading(true);
    try {
      await recordPayment({
        member_id: selectedMemberId,
        plan_id: selectedPlanId,
        amount: totalAmount,
        base_amount: baseAmount,
        addon_amount: addonAmount,
        addon_name: hasTreadmill ? 'Treadmill' : null,
        payment_date: paymentDate,
        start_date: startDate,
        expiry_date: expiryDate,
        payment_method: paymentMethod,
        notes: notes || (hasTreadmill ? 'Includes ₹300 Treadmill Add-on' : null),
      });

      setNotes('');
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      console.error('Failed to record payment:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-slate-100">Record Payment & Renewal — SHIVA GYM</DialogTitle>
        <DialogDescription className="text-slate-400">
          Create a new transaction record for membership renewal or plan extension.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-3 max-h-[80vh] overflow-y-auto pr-1">
        {/* Select Member */}
        <div className="space-y-2">
          <Label htmlFor="member">Select Member *</Label>
          <select
            id="member"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">-- Choose Member --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name} ({m.member_code}) - {m.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Select Official Shiva Gym Plan */}
        <div className="space-y-2">
          <Label htmlFor="plan">Official Membership Plan *</Label>
          <select
            id="plan"
            value={selectedPlanId}
            onChange={(e) => handlePlanChange(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">-- Choose Official Plan --</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{p.price.toLocaleString('en-IN')}
              </option>
            ))}
          </select>
        </div>

        {/* Optional Treadmill Add-on */}
        <div
          onClick={() => setHasTreadmill(!hasTreadmill)}
          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
            hasTreadmill
              ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`h-5 w-5 rounded border flex items-center justify-center ${
              hasTreadmill ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-slate-600'
            }`}>
              {hasTreadmill && <CheckCircle2 className="h-4 w-4" />}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">Treadmill Add-on</div>
              <div className="text-xs text-slate-400">Optional treadmill cardio charge</div>
            </div>
          </div>
          <div className="text-sm font-extrabold text-emerald-400">+ ₹300</div>
        </div>

        {/* Total Fee Summary */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Base Fee: </span>
            <span className="font-bold text-white">₹{baseAmount.toLocaleString('en-IN')}</span>
            {hasTreadmill && <span className="text-slate-400"> + Treadmill: <span className="font-bold text-emerald-400">₹300</span></span>}
          </div>
          <div className="text-base font-black text-emerald-400">
            Total: ₹{totalAmount.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Membership Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Membership Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes / Reference ID</Label>
          <Input
            id="notes"
            placeholder="e.g. Cash collected by Balaji / UPI Txn ID"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 font-bold">
            {loading ? 'Recording...' : 'Record Payment & Activate'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
