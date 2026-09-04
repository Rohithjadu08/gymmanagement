export const SHIVA_GYM_CONFIG = {
  gym_name: 'SHIVA GYM',
  tagline: 'SHAPE YOUR BODY',
  logo_url: '/images/shiva-gym-logo.png',
  owner_name: 'BALAJI',
  phone: '9600879081',
  formatted_phone: '+91 96008 79081',
  whatsapp_number: '919600879081',
  
  services: [
    { id: 'gym-training', name: 'Gym Training', description: 'Comprehensive weight training and cardio conditioning.' },
    { id: 'personal-training', name: 'Personal Training', description: 'One-on-one tailored guidance by expert trainers.' },
    { id: 'body-building', name: 'Body Building', description: 'Advanced muscle hypertrophy and contest prep.' },
    { id: 'state-of-art', name: 'State-of-the-Art Equipment', description: 'Modern machinery for targeted muscle isolation.' },
    { id: 'treadmill', name: 'Treadmill', description: 'Dedicated cardio stamina training equipment.' },
  ],

  treadmill_addon: {
    id: 'treadmill-addon',
    name: 'Treadmill Add-on',
    price: 300,
  },

  default_plans: [
    { name: '1 Month', duration_days: 30, price: 700 },
    { name: '2 Months', duration_days: 60, price: 1200 },
    { name: '4 Months', duration_days: 120, price: 2000 },
    { name: '6 Months', duration_days: 180, price: 2700 },
    { name: '15 Months', duration_days: 450, price: 5500 },
  ],
};
