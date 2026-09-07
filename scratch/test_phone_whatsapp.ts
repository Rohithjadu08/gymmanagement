import { normalizePhoneNumber, generateWhatsAppReminderUrl } from '../lib/utils';

console.log('=== TESTING WHATSAPP REMINDER & PHONE NORMALIZATION ===\n');

const testCases = [
  { name: 'A. Standard 10-digit Indian number', phone: '9876543210' },
  { name: 'B. 10-digit Indian number (simulated non-registered)', phone: '9123456789' },
  { name: 'C. Number with spaces', phone: '98765 43210' },
  { name: 'D. Number with +91', phone: '+919876543210' },
  { name: 'E. Number with 91', phone: '919876543210' },
  { name: 'E2. Number with hyphen & brackets', phone: '+91 (987) 654-3210' },
  { name: 'F. Missing phone number', phone: '' },
  { name: 'G. Invalid phone number', phone: '123' },
];

testCases.forEach((tc) => {
  console.log(`--- ${tc.name} ---`);
  console.log(`Input Phone: "${tc.phone}"`);
  
  const norm = normalizePhoneNumber(tc.phone);
  console.log(`Normalized Digits: "${norm.normalizedPhone}", isValid: ${norm.isValidPhone}`);
  
  const res = generateWhatsAppReminderUrl({
    phone: tc.phone,
    memberName: 'Rohith',
    expiryDate: '2026-09-10',
    isOverdue: false,
  });
  
  console.log(`Valid Phone Flag: ${res.isValidPhone}`);
  if (res.isValidPhone) {
    console.log(`WhatsApp URL: ${res.url}`);
    console.log(`Message preview: \n${res.message}`);
  } else {
    console.log(`Disabled Reason: "${res.disabledReason}"`);
  }
  console.log('\n');
});
