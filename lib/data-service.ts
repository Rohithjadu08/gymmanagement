import { createClient as createBrowserClient } from '@/lib/supabase/client';
import {
  Member,
  MemberWithDetails,
  MembershipPlan,
  Payment,
  GymSettings,
  DashboardMetrics,
} from '@/types/database.types';
import { attachMemberStatus } from './status-calculator';
import { addDays, format, subDays } from 'date-fns';

let mockSettings: GymSettings = {
  id: 'settings-1',
  gym_name: 'Iron Pulse Gym',
  logo_url: null,
  phone: '+91 98765 43210',
  whatsapp_number: '919876543210',
  warning_days: 7,
  updated_at: new Date().toISOString(),
};

let mockPlans: MembershipPlan[] = [
  {
    id: 'plan-1',
    name: 'Monthly',
    duration_days: 30,
    price: 1500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-2',
    name: '3 Months',
    duration_days: 90,
    price: 4000,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-3',
    name: '6 Months',
    duration_days: 180,
    price: 7500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-4',
    name: 'Yearly',
    duration_days: 365,
    price: 13500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const today = new Date();
const todayStr = format(today, 'yyyy-MM-dd');

let mockMembers: Member[] = [
  {
    id: 'mem-1',
    member_code: 'IP-1001',
    full_name: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul.sharma@example.com',
    joining_date: format(subDays(today, 60), 'yyyy-MM-dd'),
    notes: 'Focus on weight training',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    member_code: 'IP-1002',
    full_name: 'Priya Patel',
    phone: '9812345678',
    email: 'priya.patel@example.com',
    joining_date: format(subDays(today, 25), 'yyyy-MM-dd'),
    notes: 'Weight loss client',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    member_code: 'IP-1003',
    full_name: 'Vikram Singh',
    phone: '9988776655',
    email: 'vikram.singh@example.com',
    joining_date: format(subDays(today, 90), 'yyyy-MM-dd'),
    notes: 'Morning slot regular',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem-4',
    member_code: 'IP-1004',
    full_name: 'Ananya Verma',
    phone: '9765432109',
    email: 'ananya.v@example.com',
    joining_date: format(subDays(today, 120), 'yyyy-MM-dd'),
    notes: 'Crossfit regular',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockPayments: Payment[] = [
  {
    id: 'pay-1',
    member_id: 'mem-1',
    plan_id: 'plan-1',
    amount: 1500,
    payment_date: format(subDays(today, 10), 'yyyy-MM-dd'),
    start_date: format(subDays(today, 10), 'yyyy-MM-dd'),
    expiry_date: format(addDays(today, 20), 'yyyy-MM-dd'), // ACTIVE
    payment_method: 'UPI',
    notes: 'GPay payment',
    created_at: new Date().toISOString(),
    membership_plans: mockPlans[0],
  },
  {
    id: 'pay-2',
    member_id: 'mem-2',
    plan_id: 'plan-1',
    amount: 1500,
    payment_date: format(subDays(today, 26), 'yyyy-MM-dd'),
    start_date: format(subDays(today, 26), 'yyyy-MM-dd'),
    expiry_date: format(addDays(today, 4), 'yyyy-MM-dd'), // DUE_SOON (4 days remaining)
    payment_method: 'Card',
    notes: 'Credit Card',
    created_at: new Date().toISOString(),
    membership_plans: mockPlans[0],
  },
  {
    id: 'pay-3',
    member_id: 'mem-3',
    plan_id: 'plan-2',
    amount: 4000,
    payment_date: format(subDays(today, 95), 'yyyy-MM-dd'),
    start_date: format(subDays(today, 95), 'yyyy-MM-dd'),
    expiry_date: format(subDays(today, 5), 'yyyy-MM-dd'), // OVERDUE (5 days overdue)
    payment_method: 'Cash',
    notes: 'Cash payment',
    created_at: new Date().toISOString(),
    membership_plans: mockPlans[1],
  },
  {
    id: 'pay-4',
    member_id: 'mem-4',
    plan_id: 'plan-3',
    amount: 7500,
    payment_date: format(subDays(today, 175), 'yyyy-MM-dd'),
    start_date: format(subDays(today, 175), 'yyyy-MM-dd'),
    expiry_date: format(addDays(today, 5), 'yyyy-MM-dd'), // DUE_SOON (5 days remaining)
    payment_method: 'UPI',
    notes: 'PhonePe payment',
    created_at: new Date().toISOString(),
    membership_plans: mockPlans[2],
  },
];

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('placeholder');
}

export async function getGymSettings(): Promise<GymSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('gym_settings').select('*').single();
      if (data && !error) return data as GymSettings;
    } catch (e) {
      console.warn('Supabase fetch failed:', e);
    }
  }
  return mockSettings;
}

export async function updateGymSettings(settings: Partial<GymSettings>): Promise<GymSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('gym_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', mockSettings.id)
        .select()
        .single();
      if (data && !error) return data as GymSettings;
    } catch (e) {
      console.warn('Supabase update failed:', e);
    }
  }
  mockSettings = { ...mockSettings, ...settings, updated_at: new Date().toISOString() };
  return mockSettings;
}

export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .order('duration_days', { ascending: true });
      if (data && !error) return data as MembershipPlan[];
    } catch (e) {
      console.warn('Supabase fetch failed:', e);
    }
  }
  return mockPlans;
}

export async function createMembershipPlan(
  plan: Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>
): Promise<MembershipPlan> {
  const newPlan: MembershipPlan = {
    ...plan,
    id: `plan-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('membership_plans').insert(plan).select().single();
      if (data && !error) return data as MembershipPlan;
    } catch (e) {
      console.warn('Supabase insert failed:', e);
    }
  }

  mockPlans.push(newPlan);
  return newPlan;
}

export async function updateMembershipPlan(
  id: string,
  plan: Partial<MembershipPlan>
): Promise<MembershipPlan> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('membership_plans')
        .update({ ...plan, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (data && !error) return data as MembershipPlan;
    } catch (e) {
      console.warn('Supabase update failed:', e);
    }
  }

  mockPlans = mockPlans.map((p) =>
    p.id === id ? { ...p, ...plan, updated_at: new Date().toISOString() } : p
  );
  return mockPlans.find((p) => p.id === id)!;
}

export async function getMembers(
  searchQuery?: string,
  statusFilter?: string
): Promise<MemberWithDetails[]> {
  let membersList: Member[] = [];
  let paymentsList: Payment[] = [];
  const settings = await getGymSettings();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data: membersData } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      const { data: paymentsData } = await supabase.from('payments').select('*, membership_plans(*)');
      if (membersData) membersList = membersData as Member[];
      if (paymentsData) paymentsList = paymentsData as Payment[];
    } catch (e) {
      console.warn('Supabase fetch failed:', e);
    }
  }

  if (membersList.length === 0) {
    membersList = mockMembers;
    paymentsList = mockPayments;
  }

  let result = membersList.map((m) => {
    const memberPayments = paymentsList.filter((p) => p.member_id === m.id);
    return attachMemberStatus(m, memberPayments, settings.warning_days);
  });

  if (searchQuery && searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase().trim();
    result = result.filter(
      (m) =>
        m.full_name.toLowerCase().includes(query) ||
        m.member_code.toLowerCase().includes(query) ||
        m.phone.includes(query) ||
        (m.email && m.email.toLowerCase().includes(query))
    );
  }

  if (statusFilter && statusFilter !== 'ALL') {
    result = result.filter((m) => m.status === statusFilter);
  }

  return result;
}

export async function getMemberById(id: string): Promise<{
  member: MemberWithDetails;
  payments: Payment[];
} | null> {
  const allMembers = await getMembers();
  const member = allMembers.find((m) => m.id === id);

  if (!member) return null;

  let memberPayments = mockPayments.filter((p) => p.member_id === id);
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('payments')
        .select('*, membership_plans(*)')
        .eq('member_id', id)
        .order('expiry_date', { ascending: false });
      if (data) memberPayments = data as Payment[];
    } catch (e) {
      console.warn('Supabase fetch failed:', e);
    }
  }

  return {
    member,
    payments: memberPayments,
  };
}

export async function createMember(
  memberData: Omit<Member, 'id' | 'created_at' | 'updated_at'>
): Promise<Member> {
  const newMember: Member = {
    ...memberData,
    id: `mem-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('members').insert(memberData).select().single();
      if (data && !error) return data as Member;
    } catch (e) {
      console.warn('Supabase insert member failed:', e);
    }
  }

  mockMembers.unshift(newMember);
  return newMember;
}

export async function updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('members')
        .update({ ...memberData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (data && !error) return data as Member;
    } catch (e) {
      console.warn('Supabase update member failed:', e);
    }
  }

  mockMembers = mockMembers.map((m) =>
    m.id === id ? { ...m, ...memberData, updated_at: new Date().toISOString() } : m
  );
  return mockMembers.find((m) => m.id === id)!;
}

export async function toggleMemberActive(id: string, isActive: boolean): Promise<Member> {
  return await updateMember(id, { is_active: isActive });
}

export async function getPayments(searchQuery?: string): Promise<Payment[]> {
  let paymentsList: Payment[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('payments')
        .select('*, members(*), membership_plans(*)')
        .order('payment_date', { ascending: false });
      if (data) paymentsList = data as Payment[];
    } catch (e) {
      console.warn('Supabase fetch payments failed:', e);
    }
  }

  if (paymentsList.length === 0) {
    paymentsList = mockPayments.map((p) => ({
      ...p,
      members: mockMembers.find((m) => m.id === p.member_id),
      membership_plans: mockPlans.find((pl) => pl.id === p.plan_id),
    }));
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    paymentsList = paymentsList.filter(
      (p) =>
        p.members?.full_name.toLowerCase().includes(q) ||
        p.members?.member_code.toLowerCase().includes(q) ||
        p.membership_plans?.name.toLowerCase().includes(q) ||
        p.payment_method.toLowerCase().includes(q)
    );
  }

  return paymentsList;
}

export async function recordPayment(
  paymentData: Omit<Payment, 'id' | 'created_at'>
): Promise<Payment> {
  const newPayment: Payment = {
    ...paymentData,
    id: `pay-${Date.now()}`,
    created_at: new Date().toISOString(),
    members: mockMembers.find((m) => m.id === paymentData.member_id),
    membership_plans: mockPlans.find((p) => p.id === paymentData.plan_id),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('payments').insert(paymentData).select('*, members(*), membership_plans(*)').single();
      if (data && !error) return data as Payment;
    } catch (e) {
      console.warn('Supabase record payment failed:', e);
    }
  }

  mockPayments.unshift(newPayment);
  return newPayment;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const members = await getMembers();
  const payments = await getPayments();

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'ACTIVE').length;
  const dueSoonMembers = members.filter((m) => m.status === 'DUE_SOON').length;
  const overdueMembers = members.filter((m) => m.status === 'OVERDUE').length;

  const todayString = format(new Date(), 'yyyy-MM-dd');
  const currentMonthPrefix = format(new Date(), 'yyyy-MM');

  const todayCollection = payments
    .filter((p) => p.payment_date === todayString)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const currentMonthCollection = payments
    .filter((p) => p.payment_date.startsWith(currentMonthPrefix))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const overdueMembersList = members.filter((m) => m.status === 'OVERDUE');
  const overdueAmount = overdueMembersList.reduce(
    (sum, m) => sum + Number(m.plan_price || 0),
    0
  );

  const recentPayments = payments.slice(0, 5);
  const recentMembers = members.slice(0, 5);
  const expiringMembers = members.filter((m) => m.status === 'DUE_SOON');

  return {
    totalMembers,
    activeMembers,
    dueSoonMembers,
    overdueMembers,
    todayCollection,
    currentMonthCollection,
    totalCollected,
    overdueAmount,
    recentPayments,
    recentMembers,
    expiringMembers,
    overdueMembersList,
  };
}
