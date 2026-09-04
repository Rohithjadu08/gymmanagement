'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Phone,
  CreditCard,
  Eye,
  MessageCircle,
  Edit2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/status-badge';
import { MemberWithDetails } from '@/types/database.types';
import { getMembers, toggleMemberActive } from '@/lib/data-service';
import { formatDate, generateWhatsAppReminderUrl } from '@/lib/utils';
import { AddMemberModal } from '@/components/admin/add-member-modal';
import { EditMemberModal } from '@/components/admin/edit-member-modal';
import { RecordPaymentModal } from '@/components/admin/record-payment-modal';

export default function MembersListPage() {
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [selectedMemberToEdit, setSelectedMemberToEdit] = useState<MemberWithDetails | null>(null);

  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<string>('');

  useEffect(() => {
    loadMembers();
  }, [search, statusFilter]);

  const loadMembers = async () => {
    setLoading(true);
    const data = await getMembers(search, statusFilter);
    setMembers(data);
    setLoading(false);
  };

  const handleOpenEdit = (member: MemberWithDetails) => {
    setSelectedMemberToEdit(member);
    setEditMemberOpen(true);
  };

  const handleOpenPayment = (memberId: string) => {
    setSelectedMemberForPayment(memberId);
    setRecordPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Member Management</h1>
          <p className="text-sm text-slate-400">
            Search, filter, add, edit, or deactivate gym members.
          </p>
        </div>

        <Button
          onClick={() => setAddMemberOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <Card className="border-slate-800 bg-slate-900/90 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search member name, code, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
            {['ALL', 'ACTIVE', 'DUE_SOON', 'OVERDUE'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status === 'ALL' ? 'All Members' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Members Directory Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : members.length === 0 ? (
        <Card className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white">No Members Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            No gym members match your current filter state.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => {
            const { url: waUrl } = generateWhatsAppReminderUrl({
              phone: member.phone,
              memberName: member.full_name,
              expiryDate: member.expiry_date || '',
              isOverdue: member.status === 'OVERDUE',
            });

            return (
              <Card key={member.id} className="relative flex flex-col justify-between border-slate-800 bg-slate-900/90 hover:border-slate-700 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-300">
                      {member.member_code}
                    </span>
                    <StatusBadge status={member.status} daysRemaining={member.days_remaining} />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-extrabold text-lg shadow-md">
                      {member.full_name.charAt(0)}
                    </div>
                    <div>
                      <Link
                        href={`/admin/members/${member.id}`}
                        className="font-bold text-white text-base hover:text-emerald-400 hover:underline transition-colors"
                      >
                        {member.full_name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Phone className="h-3 w-3 text-emerald-400" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/70 p-3 text-xs space-y-1.5 border border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Plan:</span>
                      <span className="font-semibold text-slate-200">{member.plan_name || 'No Plan'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expiry Date:</span>
                      <span className="font-semibold text-slate-200">{formatDate(member.expiry_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Joined:</span>
                      <span className="text-slate-400">{formatDate(member.joining_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/members/${member.id}`}>
                      <Button size="sm" variant="outline" title="View Profile">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(member)}
                      title="Edit Member Profile"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-emerald-400" />
                    </Button>

                    <Button
                      size="sm"
                      variant="amber"
                      onClick={() => handleOpenPayment(member.id)}
                      title="Record Payment / Renew"
                    >
                      <CreditCard className="h-3.5 w-3.5 mr-1" />
                      Renew
                    </Button>
                  </div>

                  <a href={waUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="whatsapp" className="px-2.5">
                      <MessageCircle className="h-3.5 w-3.5 mr-1" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddMemberModal
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        onSuccess={loadMembers}
      />

      <EditMemberModal
        open={editMemberOpen}
        onOpenChange={setEditMemberOpen}
        member={selectedMemberToEdit}
        onSuccess={loadMembers}
      />

      <RecordPaymentModal
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        onSuccess={loadMembers}
        defaultMemberId={selectedMemberForPayment}
      />
    </div>
  );
}
