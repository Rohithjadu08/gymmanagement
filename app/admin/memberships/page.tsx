'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { MembershipPlan } from '@/types/database.types';
import { getMembershipPlans, createMembershipPlan, updateMembershipPlan } from '@/lib/data-service';
import { formatCurrency } from '@/lib/utils';

export default function MembershipPlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    duration_days: 30,
    price: 1500,
    is_active: true,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    const data = await getMembershipPlans();
    setPlans(data);
    setLoading(false);
  };

  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      duration_days: 30,
      price: 1500,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      duration_days: plan.duration_days,
      price: plan.price,
      is_active: plan.is_active,
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (plan: MembershipPlan) => {
    await updateMembershipPlan(plan.id, { is_active: !plan.is_active });
    loadPlans();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      await updateMembershipPlan(editingPlan.id, formData);
    } else {
      await createMembershipPlan(formData);
    }
    setModalOpen(false);
    loadPlans();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Membership Plans</h1>
          <p className="text-sm text-slate-400">
            Configure gym membership packages, duration in days, and fee pricing.
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      {/* Plans Cards */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col justify-between border ${
                plan.is_active ? 'border-slate-800 bg-slate-900/90' : 'border-slate-800/40 bg-slate-950/50 opacity-60'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-emerald-950/80 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-800/50">
                    {plan.duration_days} Days
                  </span>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                      plan.is_active
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{formatCurrency(plan.price)}</span>
                    <span className="text-xs text-slate-400">/ package</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEditModal(plan)}
                  className="w-full"
                >
                  <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit Plan
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Plan Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>{editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}</DialogTitle>
          <DialogDescription>
            Set duration and price for this membership package tier.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="planName">Plan Name *</Label>
            <Input
              id="planName"
              placeholder="e.g. Monthly, 3 Months, 6 Months, Yearly"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Days) *</Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="1500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
