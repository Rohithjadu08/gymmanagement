'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Member } from '@/types/database.types';
import { updateMember } from '@/lib/data-service';
import { Camera, Trash2, User, CheckCircle2 } from 'lucide-react';

interface EditMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSuccess: () => void;
}

const INTEREST_OPTIONS = [
  'Gym Training',
  'Personal Training',
  'Body Building',
  'Treadmill',
];

export function EditMemberModal({ open, onOpenChange, member, onSuccess }: EditMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    joining_date: '',
    date_of_birth: '',
    address: '',
    has_treadmill: false,
    training_goals: [] as string[],
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (member) {
      setPhotoPreview(member.photo_url || null);
      setFormData({
        full_name: member.full_name || '',
        phone: member.phone || '',
        email: member.email || '',
        joining_date: member.joining_date || '',
        date_of_birth: member.date_of_birth || '',
        address: member.address || '',
        has_treadmill: !!member.has_treadmill,
        training_goals: member.training_goals || [],
        notes: member.notes || '',
        is_active: member.is_active ?? true,
      });
    }
  }, [member]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(null);
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file size must be less than 5 MB');
      return;
    }

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
      return {
        ...prev,
        training_goals: exists
          ? prev.training_goals.filter((g) => g !== goal)
          : [...prev.training_goals, goal],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setLoading(true);
    try {
      await updateMember(member.id, {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || null,
        photo_url: photoPreview || null,
        joining_date: formData.joining_date,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address || null,
        has_treadmill: formData.has_treadmill,
        training_goals: formData.training_goals,
        notes: formData.notes || null,
        is_active: formData.is_active,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to update member:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-slate-100">
          Edit Member Profile — {member.member_code}
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          Update athlete photo, contact information, treadmill service, and training goals.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-3 max-h-[80vh] overflow-y-auto pr-1">
        {/* Profile Photo */}
        <div className="space-y-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
          <Label className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Profile Photo</Label>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full border-2 border-dashed border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Member preview" className="h-full w-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-slate-500" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors">
                  <Camera className="h-3.5 w-3.5" />
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
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
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs px-2 py-1"
                    onClick={() => setPhotoPreview(null)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                )}
              </div>
              {photoError && <p className="text-xs text-rose-400 font-medium">{photoError}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_full_name">Full Name *</Label>
          <Input
            id="edit_full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit_phone">Phone Number *</Label>
            <Input
              id="edit_phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_email">Email Address</Label>
            <Input
              id="edit_email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit_joining_date">Joining Date *</Label>
            <Input
              id="edit_joining_date"
              type="date"
              value={formData.joining_date}
              onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_dob">Date of Birth</Label>
            <Input
              id="edit_dob"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
          </div>
        </div>

        {/* Treadmill Add-on Toggle */}
        <div
          onClick={() => setFormData({ ...formData, has_treadmill: !formData.has_treadmill })}
          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
            formData.has_treadmill
              ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
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
              <div className="text-xs text-slate-400">Cardio treadmill machine access</div>
            </div>
          </div>
          <div className="text-sm font-extrabold text-emerald-400">₹300</div>
        </div>

        {/* Training Goals */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Training Goals / Interest</Label>
          <div className="grid grid-cols-2 gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = formData.training_goals.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleGoal(interest)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left border transition-all ${
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

        <div className="space-y-2">
          <Label htmlFor="edit_notes">Notes / Special Goals</Label>
          <Input
            id="edit_notes"
            placeholder="e.g. Hypertrophy training, morning slot"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="edit_is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
          />
          <Label htmlFor="edit_is_active" className="cursor-pointer text-sm">
            Active Member Account
          </Label>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 font-bold">
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
