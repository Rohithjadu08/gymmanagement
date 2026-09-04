'use client';

import React, { useState, useEffect } from 'react';
import { Building, Phone, Bell, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GymSettings } from '@/types/database.types';
import { getGymSettings, updateGymSettings } from '@/lib/data-service';

export default function SettingsPage() {
  const [settings, setSettings] = useState<GymSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getGymSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSavedSuccess(false);
    await updateGymSettings(settings);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (loading || !settings) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Gym Settings</h1>
        <p className="text-sm text-slate-400">
          Manage gym profile details, WhatsApp numbers, and automated fee alert windows.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-800 p-4 text-sm text-emerald-300">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <span>Settings updated successfully! Changes apply across WhatsApp reminders.</span>
          </div>
        )}

        <Card className="border-slate-800 bg-slate-900/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-emerald-400" />
              General Gym Information
            </CardTitle>
            <CardDescription>Brand name and contact numbers used in WhatsApp reminder messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gymName">Gym Brand Name *</Label>
              <Input
                id="gymName"
                value={settings.gym_name}
                onChange={(e) => setSettings({ ...settings, gym_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Official Contact Phone *</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Business Number *</Label>
                <Input
                  id="whatsapp"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Logic Config */}
        <Card className="border-slate-800 bg-slate-900/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-amber-400" />
              Automated Alert Configurations
            </CardTitle>
            <CardDescription>Customize when memberships transition to DUE SOON status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warningDays">Expiry Warning Window (Days)</Label>
              <Input
                id="warningDays"
                type="number"
                value={settings.warning_days}
                onChange={(e) => setSettings({ ...settings, warning_days: Number(e.target.value) })}
                required
              />
              <p className="text-xs text-slate-400">
                Memberships with expiry dates within this threshold will be flagged as "DUE SOON".
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 shadow-lg shadow-emerald-600/20"
          >
            {saving ? 'Saving Settings...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
