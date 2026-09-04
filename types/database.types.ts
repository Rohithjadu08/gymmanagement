export type MembershipStatus = 'ACTIVE' | 'DUE_SOON' | 'OVERDUE';

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface GymSettings {
  id: string;
  gym_name: string;
  logo_url?: string | null;
  phone: string;
  whatsapp_number: string;
  warning_days: number;
  updated_at: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  member_code: string;
  full_name: string;
  phone: string;
  email?: string | null;
  joining_date: string;
  date_of_birth?: string | null;
  address?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  member_id: string;
  plan_id: string;
  amount: number;
  payment_date: string;
  start_date: string;
  expiry_date: string;
  payment_method: PaymentMethod;
  notes?: string | null;
  created_at: string;
  
  // Optional relations
  membership_plans?: MembershipPlan;
  members?: Member;
}

export interface MemberWithDetails extends Member {
  latest_payment?: Payment | null;
  status: MembershipStatus;
  days_remaining: number; // positive = active/due soon days remaining, negative = overdue days
  expiry_date?: string | null;
  plan_name?: string | null;
  plan_price?: number | null;
}

export interface DashboardMetrics {
  totalMembers: number;
  activeMembers: number;
  dueSoonMembers: number;
  overdueMembers: number;
  todayCollection: number;
  currentMonthCollection: number;
  totalCollected: number;
  overdueAmount: number;
  recentPayments: Payment[];
  recentMembers: MemberWithDetails[];
  expiringMembers: MemberWithDetails[];
  overdueMembersList: MemberWithDetails[];
}
