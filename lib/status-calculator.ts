import { MembershipStatus, Payment, MemberWithDetails, Member } from '@/types/database.types';
import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';

export const DEFAULT_WARNING_DAYS = 7;

/**
 * Calculates membership status and days remaining/overdue based on expiry date.
 */
export function calculateMembershipStatus(
  expiryDateStr?: string | null,
  warningDays: number = DEFAULT_WARNING_DAYS
): { status: MembershipStatus; daysRemaining: number } {
  if (!expiryDateStr) {
    return { status: 'OVERDUE', daysRemaining: 0 };
  }

  const today = startOfDay(new Date());
  const expiryDate = startOfDay(parseISO(expiryDateStr));
  
  // positive if in future/today, negative if in past
  const daysDiff = differenceInCalendarDays(expiryDate, today);

  if (daysDiff < 0) {
    return { status: 'OVERDUE', daysRemaining: daysDiff }; // negative integer e.g. -3 (3 days overdue)
  }

  if (daysDiff <= warningDays) {
    return { status: 'DUE_SOON', daysRemaining: daysDiff };
  }

  return { status: 'ACTIVE', daysRemaining: daysDiff };
}

/**
 * Augments a member object with status, active payment info, and days remaining.
 */
export function attachMemberStatus(
  member: Member,
  payments?: Payment[],
  warningDays: number = DEFAULT_WARNING_DAYS
): MemberWithDetails {
  if (!payments || payments.length === 0) {
    return {
      ...member,
      status: 'OVERDUE',
      days_remaining: 0,
      latest_payment: null,
      expiry_date: null,
      plan_name: null,
      plan_price: null,
    };
  }

  // Find the latest payment by expiry_date
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime()
  );
  
  const latestPayment = sortedPayments[0];
  const { status, daysRemaining } = calculateMembershipStatus(latestPayment.expiry_date, warningDays);

  return {
    ...member,
    status,
    days_remaining: daysRemaining,
    latest_payment: latestPayment,
    expiry_date: latestPayment.expiry_date,
    plan_name: latestPayment.membership_plans?.name || 'Membership Plan',
    plan_price: latestPayment.amount,
  };
}
