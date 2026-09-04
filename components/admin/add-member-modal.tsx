'use client';

import React, { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createMember } from '@/lib/data-service';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMemberModal({ open, onOpenChange, onSuccess }: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    joining_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Auto-generate member code e.g. IP-1006
      const codeNumber = Math.floor(1000 + Math.random() * 9000);
      await createMember({
        member_code: `IP-${codeNumber}`,
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || null,
        joining_date: formData.joining_date,
        notes: formData.notes || null,
        is_active: true,
      });

      setFormData({
        full_name: '',
        phone: '',
        email: '',
        joining_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
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
        <DialogTitle>Add New Member</DialogTitle>
        <DialogDescription>Register a new member to the Gym Management System.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            placeholder="e.g. Vikram Sharma"
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
              placeholder="e.g. member@example.com"
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
            onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes / Special Goals</Label>
          <Input
            id="notes"
            placeholder="e.g. Weight training, morning slot"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Save Member'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

