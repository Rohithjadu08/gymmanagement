export type MembershipStatus = 'ACTIVE' | 'DUE_SOON' | 'OVERDUE';

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';

export type UserRole = 'ADMIN' | 'MEMBER';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
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
  user_id?: string | null;
  member_code: string;
  full_name: string;
  phone: string;
  email?: string | null;
  photo_url?: string | null;
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
  
  membership_plans?: MembershipPlan;
  members?: Member;
}

export interface MemberWithDetails extends Member {
  latest_payment?: Payment | null;
  status: MembershipStatus;
  days_remaining: number;
  expiry_date?: string | null;
  plan_name?: string | null;
  plan_price?: number | null;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';
  secondary_muscles: string[];
  description: string;
  instructions: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  image_url?: string | null;
  created_at: string;
}

export interface Workout {
  id: string;
  member_id: string;
  name: string;
  description?: string | null;
  assigned_by?: string | null;
  assigned_date: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  order_index: number;
  notes?: string | null;
  exercises?: Exercise;
}

export interface WorkoutLog {
  id: string;
  member_id: string;
  workout_id?: string | null;
  exercise_id: string;
  completed_sets: number;
  completed_reps: number;
  weight: number;
  duration_seconds?: number | null;
  notes?: string | null;
  completed_at: string;
  exercises?: Exercise;
}

export interface WorkoutWithDetails extends Workout {
  workout_exercises: WorkoutExercise[];
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
