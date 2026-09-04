'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Member } from '@/types/database.types';
import { updateMember } from '@/lib/data-service';

interface EditMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSuccess: () => void;
}

export function EditMemberModal({ open, onOpenChange, member, onSuccess }: EditMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    joining_date: '',
    date_of_birth: '',
    address: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (member) {
      setFormData({
        full_name: member.full_name || '',
        phone: member.phone || '',
        email: member.email || '',
        joining_date: member.joining_date || '',
        date_of_birth: member.date_of_birth || '',
        address: member.address || '',
        notes: member.notes || '',
        is_active: member.is_active ?? true,
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setLoading(true);
    try {
      await updateMember(member.id, {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || null,
        joining_date: formData.joining_date,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address || null,
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
        <DialogTitle>Edit Member Profile ({member.member_code})</DialogTitle>
        <DialogDescription>Update contact information, joining date, notes, and account status.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-4">
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

        <div className="space-y-2">
          <Label htmlFor="edit_address">Address</Label>
          <Input
            id="edit_address"
            placeholder="e.g. Flat 402, Sunshine Apartments, Metro City"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_notes">Notes / Workout Requirements</Label>
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

