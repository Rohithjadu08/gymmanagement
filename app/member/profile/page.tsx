'use client';

import { useEffect, useState } from 'react';
import { getMemberById, updateMember } from '@/lib/data-service';
import { MemberWithDetails } from '@/types/database.types';
import { User, Phone, Mail, Calendar, ShieldCheck, Check, Save } from 'lucide-react';

export default function MemberProfilePage() {
  const [member, setMember] = useState<MemberWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const data = await getMemberById('mem-1');
      if (data) {
        setMember(data.member);
        setPhone(data.member.phone || '');
        setEmail(data.member.email || '');
        setNotes(data.member.notes || '');
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setSaving(true);
    setSuccessMsg('');

    try {
      const updated = await updateMember(member.id, {
        phone,
        email,
        notes,
      });

      setMember((prev) => (prev ? { ...prev, ...updated } : null));
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Member Profile</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your personal details and view your account settings.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Sidebar */}
        <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-6 text-center shadow-lg flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-1 shadow-xl mb-4">
            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-amber-400 font-extrabold text-3xl">
              {member?.full_name?.charAt(0) || 'M'}
            </div>
          </div>

          <h2 className="text-xl font-bold text-white">{member?.full_name}</h2>
          <p className="text-xs text-amber-400 font-medium mt-0.5">{member?.member_code}</p>

          <div className="mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {member?.status || 'ACTIVE'} MEMBER
          </div>

          <div className="w-full mt-6 pt-4 border-t border-zinc-800 space-y-2 text-xs text-left">
            <div className="flex justify-between text-zinc-400">
              <span>Member Since</span>
              <span className="text-white font-medium">{member?.joining_date}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Current Plan</span>
              <span className="text-amber-400 font-medium">{member?.plan_name || 'Standard'}</span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="md:col-span-2 bg-zinc-900/90 rounded-xl border border-zinc-800 p-6 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-zinc-800 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            Personal Details
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name (Read-Only)</label>
              <input
                type="text"
                disabled
                value={member?.full_name || ''}
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-400 text-sm cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Fitness Goals & Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share your fitness goals or medical notes..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

