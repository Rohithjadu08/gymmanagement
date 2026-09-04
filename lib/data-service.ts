import { createClient as createBrowserClient } from '@/lib/supabase/client';
import {
  Member,
  MemberWithDetails,
  MembershipPlan,
  Payment,
  GymSettings,
  DashboardMetrics,
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutLog,
  WorkoutWithDetails,
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
];

let mockPayments: Payment[] = [
  {
    id: 'pay-1',
    member_id: 'mem-1',
    plan_id: 'plan-1',
    amount: 1500,
    payment_date: format(subDays(today, 10), 'yyyy-MM-dd'),
    start_date: format(subDays(today, 10), 'yyyy-MM-dd'),
    expiry_date: format(addDays(today, 20), 'yyyy-MM-dd'),
    payment_method: 'UPI',
    notes: 'GPay payment',
    created_at: new Date().toISOString(),
    membership_plans: mockPlans[0],
  },
];

export let mockExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Barbell Bench Press',
    muscle_group: 'Chest',
    secondary_muscles: ['Triceps', 'Front Delts'],
    description: 'The premier compound strength movement for chest mass and upper body pushing power.',
    instructions: [
      'Lie flat on bench with feet planted firmly on the floor.',
      'Grip barbell slightly wider than shoulder width.',
      'Unrack barbell with arms locked.',
      'Lower bar with control until it gently touches mid-chest.',
      'Drive feet into floor and push bar explosively upward to starting position.',
    ],
    difficulty: 'Intermediate',
    equipment: 'Barbell & Flat Bench',
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-2',
    name: 'Incline Dumbbell Press',
    muscle_group: 'Chest',
    secondary_muscles: ['Upper Chest', 'Triceps'],
    description: 'Targets upper pectoral fibers for complete chest development.',
    instructions: [
      'Set bench to a 30-45 degree incline.',
      'Sit with dumbbells resting on thighs, then kick back onto bench.',
      'Press dumbbells up until arms are fully extended.',
      'Lower dumbbells under control to chest level.',
      'Press back up squeezing upper chest at top.',
    ],
    difficulty: 'Intermediate',
    equipment: 'Dumbbells & Incline Bench',
    image_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-3',
    name: 'Lat Pulldown',
    muscle_group: 'Back',
    secondary_muscles: ['Biceps', 'Rear Delts'],
    description: 'Builds latissimus dorsi width and upper back thickness.',
    instructions: [
      'Grip wide bar with overhand grip wider than shoulders.',
      'Sit with thighs secured under pads.',
      'Pull bar down towards upper chest while arching back slightly.',
      'Pause for 1 second at bottom squeezing lat muscles.',
      'Slowly return bar back up with full stretch.',
    ],
    difficulty: 'Beginner',
    equipment: 'Cable Lat Pulldown Machine',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-4',
    name: 'Barbell Back Squat',
    muscle_group: 'Legs',
    secondary_muscles: ['Glutes', 'Hamstrings', 'Core'],
    description: 'The king of lower body movements for quad development and leg strength.',
    instructions: [
      'Rest barbell securely across upper traps.',
      'Stand with feet shoulder-width apart, toes turned slightly out.',
      'Brace core and lower hips back and down until thighs are parallel to floor.',
      'Drive through heels and extend knees and hips back to standing position.',
    ],
    difficulty: 'Advanced',
    equipment: 'Barbell & Squat Rack',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-5',
    name: 'Dumbbell Shoulder Press',
    muscle_group: 'Shoulders',
    secondary_muscles: ['Triceps', 'Upper Traps'],
    description: 'Overhead pressing movement for anterior and lateral deltoid mass.',
    instructions: [
      'Sit upright on bench holding dumbbells at shoulder level.',
      'Press dumbbells overhead until arms are nearly locked out.',
      'Lower weights smoothly back to ear level.',
    ],
    difficulty: 'Intermediate',
    equipment: 'Dumbbells & Bench',
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-6',
    name: 'Barbell Bicep Curl',
    muscle_group: 'Arms',
    secondary_muscles: ['Forearms'],
    description: 'Strict curling movement for bicep peak and arm thickness.',
    instructions: [
      'Stand upright holding EZ or straight barbell with underhand grip.',
      'Keep elbows tucked close to torso and curl bar towards chest.',
      'Squeeze biceps hard at top, then lower with control.',
    ],
    difficulty: 'Beginner',
    equipment: 'Barbell',
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
    created_at: new Date().toISOString(),
  },
];

let mockWorkouts: WorkoutWithDetails[] = [
  {
    id: 'w-1',
    member_id: 'mem-1',
    name: 'Push Day - Hypertrophy',
    description: 'Focus on chest, shoulders, and triceps volume.',
    assigned_by: 'admin-1',
    assigned_date: format(today, 'yyyy-MM-dd'),
    status: 'ASSIGNED',
    created_at: new Date().toISOString(),
    workout_exercises: [
      {
        id: 'we-1',
        workout_id: 'w-1',
        exercise_id: 'ex-1',
        sets: 4,
        reps: 10,
        rest_seconds: 90,
        order_index: 1,
        notes: 'Work up to 60kg working weight',
        exercises: mockExercises[0],
      },
      {
        id: 'we-2',
        workout_id: 'w-1',
        exercise_id: 'ex-2',
        sets: 3,
        reps: 12,
        rest_seconds: 60,
        order_index: 2,
        notes: '30 degree incline',
        exercises: mockExercises[1],
      },
      {
        id: 'we-3',
        workout_id: 'w-1',
        exercise_id: 'ex-5',
        sets: 3,
        reps: 12,
        rest_seconds: 60,
        order_index: 3,
        notes: 'Strict shoulder press',
        exercises: mockExercises[4],
      },
    ],
  },
];

let mockWorkoutLogs: WorkoutLog[] = [
  {
    id: 'wl-1',
    member_id: 'mem-1',
    workout_id: 'w-1',
    exercise_id: 'ex-1',
    completed_sets: 4,
    completed_reps: 10,
    weight: 60,
    duration_seconds: 900,
    notes: 'Pushed last 2 reps strong',
    completed_at: format(subDays(today, 1), 'yyyy-MM-dd HH:mm:ss'),
    exercises: mockExercises[0],
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

// -------------------------------------------------------------
// MEMBER FITNESS & WORKOUT SERVICES
// -------------------------------------------------------------

export async function getExercises(muscleGroupFilter?: string): Promise<Exercise[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      let query = supabase.from('exercises').select('*');
      if (muscleGroupFilter && muscleGroupFilter !== 'ALL') {
        query = query.eq('muscle_group', muscleGroupFilter);
      }
      const { data } = await query;
      if (data && data.length > 0) return data as Exercise[];
    } catch (e) {
      console.warn('Supabase get exercises failed:', e);
    }
  }

  if (muscleGroupFilter && muscleGroupFilter !== 'ALL') {
    return mockExercises.filter((e) => e.muscle_group.toLowerCase() === muscleGroupFilter.toLowerCase());
  }

  return mockExercises;
}

export async function getWorkoutsForMember(memberId: string): Promise<WorkoutWithDetails[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('workouts')
        .select('*, workout_exercises(*, exercises(*))')
        .eq('member_id', memberId)
        .order('assigned_date', { ascending: false });
      if (data && data.length > 0) return data as WorkoutWithDetails[];
    } catch (e) {
      console.warn('Supabase get workouts failed:', e);
    }
  }

  return mockWorkouts.filter((w) => w.member_id === memberId || w.member_id === 'mem-1');
}

export async function createWorkoutAssignment(
  workoutData: Omit<Workout, 'id' | 'created_at'>,
  exercisesData: Array<{ exercise_id: string; sets: number; reps: number; rest_seconds: number; notes?: string }>
): Promise<WorkoutWithDetails> {
  const workoutId = `w-${Date.now()}`;
  const newWorkout: WorkoutWithDetails = {
    ...workoutData,
    id: workoutId,
    created_at: new Date().toISOString(),
    workout_exercises: exercisesData.map((ex, idx) => ({
      id: `we-${Date.now()}-${idx}`,
      workout_id: workoutId,
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps: ex.reps,
      rest_seconds: ex.rest_seconds,
      order_index: idx + 1,
      notes: ex.notes || null,
      exercises: mockExercises.find((e) => e.id === ex.exercise_id),
    })),
  };

  mockWorkouts.unshift(newWorkout);
  return newWorkout;
}

export async function logWorkoutProgress(
  log: Omit<WorkoutLog, 'id' | 'completed_at'>
): Promise<WorkoutLog> {
  const newLog: WorkoutLog = {
    ...log,
    id: `wl-${Date.now()}`,
    completed_at: new Date().toISOString(),
    exercises: mockExercises.find((e) => e.id === log.exercise_id),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      await supabase.from('workout_logs').insert(log);
    } catch (e) {
      console.warn('Supabase log workout failed:', e);
    }
  }

  mockWorkoutLogs.unshift(newLog);
  return newLog;
}

export async function getWorkoutLogsForMember(memberId: string): Promise<WorkoutLog[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('workout_logs')
        .select('*, exercises(*)')
        .eq('member_id', memberId)
        .order('completed_at', { ascending: false });
      if (data && data.length > 0) return data as WorkoutLog[];
    } catch (e) {
      console.warn('Supabase fetch workout logs failed:', e);
    }
  }

  return mockWorkoutLogs.filter((l) => l.member_id === memberId || l.member_id === 'mem-1');
}
