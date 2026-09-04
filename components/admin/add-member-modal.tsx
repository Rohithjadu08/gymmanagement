'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createMember, getMembershipPlans, recordPayment } from '@/lib/data-service';
import { MembershipPlan } from '@/types/database.types';
import { SHIVA_GYM_CONFIG } from '@/lib/gym-config';
import { Camera, Image as ImageIcon, Trash2, CheckCircle2, User } from 'lucide-react';
import { format, addMonths, parseISO } from 'date-fns';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const INTEREST_OPTIONS = [
  'Gym Training',
  'Personal Training',
  'Body Building',
  'Treadmill',
];

export function AddMemberModal({ open, onOpenChange, onSuccess }: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    joining_date: new Date().toISOString().split('T')[0],
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    has_treadmill: false,
    training_goals: [] as string[],
    notes: '',
  });

  // Load plans on open
  useEffect(() => {
    if (open) {
      getMembershipPlans().then((loadedPlans) => {
        setPlans(loadedPlans);
        if (loadedPlans.length > 0) {
          const currentValid = loadedPlans.find((p) => p.id === formData.plan_id);
          if (!currentValid) {
            setFormData((prev) => ({ ...prev, plan_id: loadedPlans[0].id }));
          }
        }
      });
    }
  }, [open]);

  // Selected plan details
  const selectedPlan = plans.find((p) => p.id === formData.plan_id) || plans[0];
  const baseFee = selectedPlan ? Number(selectedPlan.price) : 0;
  const treadmillFee = formData.has_treadmill ? SHIVA_GYM_CONFIG.treadmill_addon.price : 0;
  const totalFee = baseFee + treadmillFee;

  // Calculate Expiry Date using calendar months based on plan name/duration
  const calculateExpiry = () => {
    if (!formData.start_date || !selectedPlan) return '';
    try {
      const startDate = parseISO(formData.start_date);
      let monthsToAdd = 1;
      if (selectedPlan.name.includes('15')) monthsToAdd = 15;
      else if (selectedPlan.name.includes('6')) monthsToAdd = 6;
      else if (selectedPlan.name.includes('4')) monthsToAdd = 4;
      else if (selectedPlan.name.includes('2')) monthsToAdd = 2;
      else if (selectedPlan.name.includes('1')) monthsToAdd = 1;
      else monthsToAdd = Math.round(selectedPlan.duration_days / 30);

      const expiry = addMonths(startDate, monthsToAdd);
      return format(expiry, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  const calculatedExpiry = calculateExpiry();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(null);
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file size must be less than 5 MB');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setPhotoError('Please select a valid JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => {
      const exists = prev.training_goals.includes(goal);
      if (exists) {
        return { ...prev, training_goals: prev.training_goals.filter((g) => g !== goal) };
      } else {
        return { ...prev, training_goals: [...prev.training_goals, goal] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const codeNumber = Math.floor(1000 + Math.random() * 9000);
      const memberCode = `SG-${codeNumber}`;

      // 1. Create Member
      const createdMember = await createMember({
        member_code: memberCode,
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || null,
        photo_url: photoPreview || null,
        joining_date: formData.joining_date,
        notes: formData.notes || null,
        training_goals: formData.training_goals,
        has_treadmill: formData.has_treadmill,
        is_active: true,
      });

      // 2. Record Payment Ledger Transaction
      if (selectedPlan && createdMember) {
        await recordPayment({
          member_id: createdMember.id,
          plan_id: selectedPlan.id,
          amount: totalFee,
          base_amount: baseFee,
          addon_amount: treadmillFee,
          addon_name: formData.has_treadmill ? 'Treadmill' : null,
          payment_date: formData.start_date,
          start_date: formData.start_date,
          expiry_date: calculatedExpiry || formData.start_date,
          payment_method: 'Cash',
          notes: formData.has_treadmill ? 'Includes ₹300 Treadmill Add-on' : 'Initial Registration',
        });
      }

      // Reset
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        joining_date: new Date().toISOString().split('T')[0],
        plan_id: plans[0]?.id || '',
        start_date: new Date().toISOString().split('T')[0],
        has_treadmill: false,
        training_goals: [],
        notes: '',
      });
      setPhotoPreview(null);
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      console.error('Failed to create member:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-slate-100">Add New Member — SHIVA GYM</DialogTitle>
        <DialogDescription className="text-slate-400">
          Register a new athlete to SHIVA GYM system with profile photo and plan assignment.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 py-3 max-h-[80vh] overflow-y-auto pr-1">
        {/* SECTION 1: PROFILE PHOTO */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <Label className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Profile Photo</Label>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-full border-2 border-dashed border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Member preview" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-slate-500" />
              )}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                  <Camera className="h-4 w-4" />
                  {photoPreview ? 'Change Photo' : 'Upload Member Photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                {photoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs"
                    onClick={() => setPhotoPreview(null)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Allowed formats: JPG, JPEG, PNG, WEBP (Max 5MB)</p>
              {photoError && <p className="text-xs text-rose-400 font-medium">{photoError}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 2: PERSONAL INFORMATION */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Personal Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              placeholder="e.g. Rahul Sharma"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="joining_date">Joining Date *</Label>
            <Input
              id="joining_date"
              type="date"
              value={formData.joining_date}
              onChange={(e) => setFormData({ ...formData, joining_date: e.target.value, start_date: e.target.value })}
              required
            />
          </div>
        </div>

        {/* SECTION 3: MEMBERSHIP DETAILS */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Membership Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Official Membership Plan *</Label>
              <select
                id="plan"
                value={formData.plan_id}
                onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — ₹{plan.price.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Membership Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Membership Fee (Auto Filled):</span>
              <div className="text-lg font-bold text-white">₹{baseFee.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Calculated Expiry Date:</span>
              <div className="text-lg font-bold text-emerald-400">{calculatedExpiry || '—'}</div>
            </div>
          </div>

          {/* OPTIONAL SERVICES / TREADMILL ADD-ON */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <Label className="text-xs font-semibold text-slate-300">Optional Gym Services</Label>
            <div
              onClick={() => setFormData({ ...formData, has_treadmill: !formData.has_treadmill })}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                formData.has_treadmill
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded border flex items-center justify-center ${
                  formData.has_treadmill ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-slate-600'
                }`}>
                  {formData.has_treadmill && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100">Treadmill Service Add-on</div>
                  <div className="text-xs text-slate-400">Access to cardio treadmill machines</div>
                </div>
              </div>
              <div className="text-sm font-extrabold text-emerald-400">+ ₹300</div>
            </div>
          </div>

          {/* TOTAL PAYMENT CALCULATION */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-800/40 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">TOTAL PAYABLE AMOUNT:</span>
            <div className="text-xl font-black text-emerald-400">
              ₹{totalFee.toLocaleString('en-IN')}
              {formData.has_treadmill && <span className="text-xs font-normal text-slate-400 ml-1">(₹{baseFee} + ₹300)</span>}
            </div>
          </div>
        </div>

        {/* SECTION 4: TRAINING INTEREST / GOALS */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Training Interest / Goal</Label>
          <div className="grid grid-cols-2 gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = formData.training_goals.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleGoal(interest)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '} {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: NOTES */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes / Special Goals</Label>
          <Input
            id="notes"
            placeholder="e.g. Morning timing preference, competition prep"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <DialogFooter className="mt-6 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 font-bold"
          >
            {loading ? 'Saving Member...' : 'Save Member'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
