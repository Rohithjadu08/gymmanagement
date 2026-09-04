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
  gym_name: 'SHIVA GYM',
  logo_url: null,
  phone: '9600879081',
  whatsapp_number: '919600879081',
  warning_days: 7,
  updated_at: new Date().toISOString(),
};

let mockPlans: MembershipPlan[] = [
  {
    id: 'plan-1',
    name: '1 Month',
    duration_days: 30,
    price: 700,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-2',
    name: '2 Months',
    duration_days: 60,
    price: 1200,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-3',
    name: '4 Months',
    duration_days: 120,
    price: 2000,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-4',
    name: '6 Months',
    duration_days: 180,
    price: 2700,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-5',
    name: '15 Months',
    duration_days: 450,
    price: 5500,
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
    member_code: 'SG-1001',
    full_name: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul.sharma@example.com',
    joining_date: format(subDays(today, 60), 'yyyy-MM-dd'),
    notes: 'Focus on weight training',
    training_goals: ['Gym Training', 'Body Building'],
    has_treadmill: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    member_code: 'SG-1002',
    full_name: 'Priya Patel',
    phone: '9812345678',
    email: 'priya.patel@example.com',
    joining_date: format(subDays(today, 25), 'yyyy-MM-dd'),
    notes: 'Weight loss client',
    training_goals: ['Personal Training', 'Treadmill'],
    has_treadmill: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    member_code: 'SG-1003',
    full_name: 'Vikram Singh',
    phone: '9988776655',
    email: 'vikram.singh@example.com',
    joining_date: format(subDays(today, 90), 'yyyy-MM-dd'),
    notes: 'Morning slot regular',
    training_goals: ['Gym Training'],
    has_treadmill: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mem-4',
    member_code: 'SG-1004',
    full_name: 'Ananya Verma',
    phone: '9765432109',
    email: 'ananya.v@example.com',
    joining_date: format(subDays(today, 120), 'yyyy-MM-dd'),
    notes: 'Crossfit regular',
    training_goals: ['Gym Training', 'Treadmill'],
    has_treadmill: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockPayments: Payment[] = [
  {
    id: 'pay-1',
    member_id: 'mem-1',
    plan_id: 'plan-3',
    amount: 2300,
    base_amount: 2000,
    addon_amount: 300,
    addon_name: 'Treadmill',
    payment_date: format(subDays(today, 10), 'yyyy-MM-dd'),
    start_date: format(subDays(today, 10), 'yyyy-MM-dd'),
    expiry_date: format(addDays(today, 110), 'yyyy-MM-dd'),
    payment_method: 'UPI',
    notes: 'GPay payment with Treadmill add-on',
    created_at: new Date().toISOString(),
    membership_plans: mockPlans[2],
  },
  {
    id: 'pay-2',
    member_id: 'mem-2',
    plan_id: 'plan-1',
    amount: 1000,
    base_amount: 700,
    addon_amount: 300,
    addon_name: 'Treadmill',
    payment_date: format(subDays(today, 26), 'yyyy-MM-dd'),
    start_date: format(subDays(today, 26), 'yyyy-MM-dd'),
    expiry_date: format(addDays(today, 4), 'yyyy-MM-dd'),
    payment_method: 'Card',
    notes: 'Credit Card',
    created_at: new Date().toISOString(),
    membership_plans: mockPlans[0],
  },
  {
    id: 'pay-3',
    member_id: 'mem-3',
    plan_id: 'plan-2',
    amount: 1200,
    base_amount: 1200,
    addon_amount: 0,
    addon_name: null,
    payment_date: format(subDays(today, 95), 'yyyy-MM-dd'),
    start_date: format(subDays(today, 95), 'yyyy-MM-dd'),
    expiry_date: format(subDays(today, 5), 'yyyy-MM-dd'),
    payment_method: 'Cash',
    notes: 'Cash payment',
    created_at: new Date().toISOString(),
    membership_plans: mockPlans[1],
  },
];

export let mockExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Barbell Bench Press',
    muscle_group: 'Chest',
    secondary_muscles: ['Triceps', 'Shoulders'],
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
    secondary_muscles: ['Shoulders', 'Triceps'],
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
    secondary_muscles: ['Biceps', 'Shoulders'],
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
    name: 'Barbell Bent-Over Row',
    muscle_group: 'Back',
    secondary_muscles: ['Biceps', 'Forearms', 'Core'],
    description: 'Essential free-weight rowing exercise for middle back and lat thickness.',
    instructions: [
      'Hinge forward at hips keeping spine neutral and knees slightly bent.',
      'Grip bar slightly wider than shoulder-width with overhand grip.',
      'Pull bar to lower sternum squeezing shoulder blades together.',
      'Lower bar with full control under resistance.',
    ],
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    image_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-5',
    name: 'Dumbbell Shoulder Press',
    muscle_group: 'Shoulders',
    secondary_muscles: ['Triceps'],
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
    name: 'Standing Dumbbell Lateral Raise',
    muscle_group: 'Shoulders',
    secondary_muscles: ['Traps'],
    description: 'Isolated lateral deltoid raise to build shoulder width and capping shape.',
    instructions: [
      'Stand holding dumbbells at sides with slight elbow bend.',
      'Raise dumbbells outward until parallel to floor.',
      'Pause briefly at top contracting side deltoids, then lower with control.',
    ],
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-7',
    name: 'Barbell Bicep Curl',
    muscle_group: 'Biceps',
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
  {
    id: 'ex-8',
    name: 'Dumbbell Hammer Curls',
    muscle_group: 'Biceps',
    secondary_muscles: ['Forearms'],
    description: 'Neutral grip curl targeting brachialis and forearm thickness.',
    instructions: [
      'Hold dumbbells with neutral palms-facing-in grip.',
      'Curl dumbbells upward towards shoulders keeping upper arms still.',
      'Lower smoothly without swinging hips.',
    ],
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-9',
    name: 'Tricep Rope Pushdown',
    muscle_group: 'Triceps',
    secondary_muscles: ['Forearms'],
    description: 'Cable pushdown isolating lateral and medial heads of the triceps.',
    instructions: [
      'Attach rope attachment to high pulley.',
      'Keep elbows tucked at sides and push rope down toward thighs.',
      'Spread rope ends apart at bottom for peak contraction.',
      'Return to 90 degree elbow bend under control.',
    ],
    difficulty: 'Beginner',
    equipment: 'Cable Machine & Rope',
    image_url: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-10',
    name: 'Barbell Skull Crushers',
    muscle_group: 'Triceps',
    secondary_muscles: ['Chest', 'Shoulders'],
    description: 'Overhead tricep extension building long-head tricep horseshoe mass.',
    instructions: [
      'Lie on flat bench holding EZ bar with narrow grip over chest.',
      'Bend elbows to lower bar towards forehead keeping upper arms vertical.',
      'Extend arms back up to starting position squeezing triceps.',
    ],
    difficulty: 'Intermediate',
    equipment: 'EZ Barbell & Bench',
    image_url: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-11',
    name: 'Barbell Wrist Curls',
    muscle_group: 'Forearms',
    secondary_muscles: ['Grip Strength'],
    description: 'Direct forearm flexor isolation movement for grip strength and forearm girth.',
    instructions: [
      'Rest forearms on flat bench with wrists hanging over edge holding barbell.',
      'Lower barbell allowing fingers to slightly uncurl.',
      'Curl wrists upward as high as possible squeezing forearm flexors.',
    ],
    difficulty: 'Beginner',
    equipment: 'Barbell & Bench',
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-12',
    name: 'Hanging Leg Raise',
    muscle_group: 'Abs',
    secondary_muscles: ['Hip Flexors', 'Grip'],
    description: 'Core exercise targeting lower rectus abdominis and hip flexors.',
    instructions: [
      'Hang from pull-up bar with overhand grip.',
      'Keep legs straight or slightly bent and raise them until parallel to floor.',
      'Pause briefly, then lower legs with control without swinging.',
    ],
    difficulty: 'Intermediate',
    equipment: 'Pull-up Bar',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-13',
    name: 'Barbell Hip Thrust',
    muscle_group: 'Glutes',
    secondary_muscles: ['Hamstrings', 'Core'],
    description: 'Premier isolation movement for maximum gluteus maximus activation and power.',
    instructions: [
      'Sit on floor with upper back against bench and padded barbell across hips.',
      'Drive through heels to lift hips upward until torso and thighs form straight line.',
      'Squeeze glutes forcefully at top for 2 seconds before lowering under control.',
    ],
    difficulty: 'Intermediate',
    equipment: 'Barbell & Bench',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-14',
    name: 'Barbell Back Squat',
    muscle_group: 'Quadriceps',
    secondary_muscles: ['Glutes', 'Hamstrings', 'Abs'],
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
    id: 'ex-15',
    name: 'Leg Extension Machine',
    muscle_group: 'Quadriceps',
    secondary_muscles: [],
    description: 'Pure isolated quadriceps extension for quad teardrop mass.',
    instructions: [
      'Adjust seat so knees align with machine pivot axis.',
      'Hook ankles behind padded lever.',
      'Extend legs upward until fully extended squeezing quads at top.',
      'Lower weight smoothly back down.',
    ],
    difficulty: 'Beginner',
    equipment: 'Leg Extension Machine',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-16',
    name: 'Romanian Deadlift (RDL)',
    muscle_group: 'Hamstrings',
    secondary_muscles: ['Glutes', 'Lower Back'],
    description: 'Posterior chain builder focusing on hamstring stretch and glute extension.',
    instructions: [
      'Stand tall holding barbell with overhand grip.',
      'Push hips backward while lowering bar down front of legs.',
      'Maintain flat back until deep stretch is felt in hamstrings.',
      'Drive hips forward to return to standing.',
    ],
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    image_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-17',
    name: 'Standing Calf Raise',
    muscle_group: 'Calves',
    secondary_muscles: ['Achilles Tendon'],
    description: 'Direct gastrocnemius calf isolation for lower leg size and power.',
    instructions: [
      'Place balls of feet on block with heels hanging off.',
      'Lower heels downward for deep stretch in calves.',
      'Explode upward onto toes as high as possible and squeeze calf muscles.',
    ],
    difficulty: 'Beginner',
    equipment: 'Calf Block / Machine',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
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

async function withTimeout<T>(promise: PromiseLike<T>, ms = 1000): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Supabase request timeout')), ms)
  );
  return Promise.race([Promise.resolve(promise), timeout]);
}

export async function getGymSettings(): Promise<GymSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await withTimeout(supabase.from('gym_settings').select('*').single());
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

const OFFICIAL_PLAN_NAMES = ['1 Month', '2 Months', '4 Months', '6 Months', '15 Months'];

export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await withTimeout(
        supabase
          .from('membership_plans')
          .select('*')
          .eq('is_active', true)
          .order('duration_days', { ascending: true })
      );
      if (data && !error && data.length > 0) {
        const filtered = (data as MembershipPlan[]).filter((p) =>
          OFFICIAL_PLAN_NAMES.some((officialName) => p.name.toLowerCase().includes(officialName.toLowerCase()))
        );
        if (filtered.length > 0) return filtered;
      }
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
      const { data: membersData } = await withTimeout(supabase.from('members').select('*').order('created_at', { ascending: false }));
      const { data: paymentsData } = await withTimeout(supabase.from('payments').select('*, membership_plans(*)'));
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
      const { data } = await withTimeout(supabase
        .from('payments')
        .select('*, membership_plans(*)')
        .eq('member_id', id)
        .order('expiry_date', { ascending: false }));
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
      const { data } = await withTimeout(supabase
        .from('payments')
        .select('*, members(*), membership_plans(*)')
        .order('payment_date', { ascending: false }));
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
  const filter = muscleGroupFilter?.trim();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserClient();
      let query = supabase.from('exercises').select('*');
      if (filter && filter !== 'ALL') {
        query = query.or(`muscle_group.ilike.${filter},secondary_muscles.cs.{${filter}}`);
      }
      const { data } = await withTimeout(query);
      if (data && data.length > 0) return data as Exercise[];
    } catch (e) {
      console.warn('Supabase get exercises failed:', e);
    }
  }

  if (!filter || filter === 'ALL') {
    return mockExercises;
  }

  const targetLower = filter.toLowerCase();
  
  // Category mapping fallbacks (e.g., Arms -> Biceps, Triceps, Forearms; Legs -> Quadriceps, Hamstrings, Glutes, Calves)
  const categoryMap: Record<string, string[]> = {
    arms: ['biceps', 'triceps', 'forearms'],
    legs: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'legs'],
    core: ['abs', 'core', 'lower back'],
  };

  const allowedMuscles = categoryMap[targetLower] || [targetLower];

  return mockExercises.filter((e) => {
    const primary = e.muscle_group.toLowerCase();
    const secondaries = (e.secondary_muscles || []).map((m) => m.toLowerCase());
    
    return (
      allowedMuscles.includes(primary) ||
      secondaries.some((sec) => allowedMuscles.includes(sec))
    );
  });
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
