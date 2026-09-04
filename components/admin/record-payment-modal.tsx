'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MemberWithDetails, MembershipPlan, PaymentMethod } from '@/types/database.types';
import { getMembers, getMembershipPlans, recordPayment } from '@/lib/data-service';
import { addDays, format, parseISO } from 'date-fns';

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
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expiryDate, setExpiryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
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

    if (fetchedPlans.length > 0 && !selectedPlanId) {
      handlePlanChange(fetchedPlans[0].id, fetchedPlans);
    }
  };

  const handlePlanChange = (planId: string, availablePlans = plans) => {
    setSelectedPlanId(planId);
    const plan = availablePlans.find((p) => p.id === planId);
    if (plan) {
      setAmount(plan.price);
      // Auto-calculate expiry date
      const start = parseISO(startDate);
      const expiry = addDays(start, plan.duration_days);
      setExpiryDate(format(expiry, 'yyyy-MM-dd'));
    }
  };

  const handleStartDateChange = (newStartDateStr: string) => {
    setStartDate(newStartDateStr);
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (plan && newStartDateStr) {
      const start = parseISO(newStartDateStr);
      const expiry = addDays(start, plan.duration_days);
      setExpiryDate(format(expiry, 'yyyy-MM-dd'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedPlanId || !amount || !expiryDate) {
      alert('Please complete all required payment details');
      return;
    }

    setLoading(true);
    try {
      await recordPayment({
        member_id: selectedMemberId,
        plan_id: selectedPlanId,
        amount: Number(amount),
        payment_date: paymentDate,
        start_date: startDate,
        expiry_date: expiryDate,
        payment_method: paymentMethod,
        notes: notes || null,
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
        <DialogTitle>Record Payment & Renew Membership</DialogTitle>
        <DialogDescription>
          Record a new payment transaction for a member. This automatically creates a new ledger record.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-4">
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

        {/* Select Membership Plan */}
        <div className="space-y-2">
          <Label htmlFor="plan">Membership Plan *</Label>
          <select
            id="plan"
            value={selectedPlanId}
            onChange={(e) => handlePlanChange(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">-- Choose Plan --</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.duration_days} days) - ₹{p.price}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount Paid (₹) *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card Swipe</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Auto)</Label>
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
          <Label htmlFor="notes">Transaction Notes / Reference ID</Label>
          <Input
            id="notes"
            placeholder="e.g. UPI Ref #987123654"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Recording...' : 'Record Payment & Activate'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

