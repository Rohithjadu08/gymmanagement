import { generateWhatsAppReminderUrl } from '../lib/utils';

console.log('==================================================');
console.log('WHATSAPP REMINDER BRANDING AUDIT TEST');
console.log('==================================================\n');

const testCases = [
  { type: 'Upcoming Expiry (7 days)', memberName: 'Rohith P', expiryDate: '2026-09-14', isOverdue: false },
  { type: 'Due Soon Expiry (1 day)', memberName: 'Balaji K', expiryDate: '2026-09-08', isOverdue: false },
  { type: 'Overdue Expiry (Expired)', memberName: 'Suresh M', expiryDate: '2026-09-01', isOverdue: true },
];

let allPassed = true;

testCases.forEach((tc) => {
  const { url, message } = generateWhatsAppReminderUrl({
    phone: '9876543210',
    memberName: tc.memberName,
    expiryDate: tc.expiryDate,
    isOverdue: tc.isOverdue,
  });

  const containsShivaGym = message.includes('Shiva Gym');
  const containsIronPulse = /Iron\s*Pulse/i.test(message);

  console.log(`[${tc.type}]`);
  console.log(`Generated Message:\n"${message}"\n`);
  console.log(`- Contains "Shiva Gym": ${containsShivaGym ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Contains "Iron Pulse": ${!containsIronPulse ? '✅ PASS (NONE)' : '❌ FAIL'}`);
  console.log(`- Generated WhatsApp URL: ${url}\n`);

  if (!containsShivaGym || containsIronPulse) {
    allPassed = false;
  }
});

if (allPassed) {
  console.log('✅ ALL WHATSAPP MESSAGES STRICTLY USE "Shiva Gym" AND ZERO OLD BRANDING!');
} else {
  console.error('❌ BRANDING AUDIT FAILED!');
  process.exit(1);
}
