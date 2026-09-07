import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in INR (₹) or standard locale currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date nicely e.g., "15 Aug 2026"
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Safe phone number normalization utility for WhatsApp and telecommunications.
 * Removes spaces, hyphens, brackets, leading +, and special characters.
 * Correctly handles Indian 10-digit mobile numbers by prepending '91' without duplicating.
 */
export function normalizePhoneNumber(phone?: string | null): {
  normalizedPhone: string;
  isValidPhone: boolean;
  rawDigits: string;
} {
  if (!phone || typeof phone !== 'string') {
    return { normalizedPhone: '', isValidPhone: false, rawDigits: '' };
  }

  // Clean all non-digit characters
  let digits = phone.replace(/[^0-9]/g, '');

  if (!digits) {
    return { normalizedPhone: '', isValidPhone: false, rawDigits: '' };
  }

  // Handle leading '0' for Indian 11-digit numbers (e.g., '09876543210' -> '9876543210')
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  let normalizedPhone = digits;

  // Indian numbers: 10 digits starting with 6, 7, 8, or 9
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    normalizedPhone = '91' + digits;
  }

  // Standard E.164 phone numbers have 7 to 15 digits
  const isValidPhone = normalizedPhone.length >= 7 && normalizedPhone.length <= 15;

  return {
    normalizedPhone,
    isValidPhone,
    rawDigits: digits,
  };
}

/**
 * Generate WhatsApp click-to-chat URL with pre-filled reminder template.
 * Always enables for valid phone numbers without checking WhatsApp registration state.
 */
export function generateWhatsAppReminderUrl({
  phone,
  memberName,
  expiryDate,
  isOverdue,
  gymName = 'Shiva Gym',
}: {
  phone?: string | null;
  memberName: string;
  expiryDate?: string | null;
  isOverdue: boolean;
  gymName?: string;
}): {
  url: string;
  message: string;
  isValidPhone: boolean;
  normalizedPhone: string;
  disabledReason?: string;
} {
  const { normalizedPhone, isValidPhone } = normalizePhoneNumber(phone);

  if (!phone || !phone.trim()) {
    return {
      url: '',
      message: '',
      isValidPhone: false,
      normalizedPhone: '',
      disabledReason: 'WhatsApp unavailable — phone number missing',
    };
  }

  if (!isValidPhone) {
    return {
      url: '',
      message: '',
      isValidPhone: false,
      normalizedPhone,
      disabledReason: 'WhatsApp unavailable — invalid phone number',
    };
  }

  const formattedExpiry = formatDate(expiryDate);

  let message = '';
  if (isOverdue) {
    message = `Hi ${memberName},\n\nYour ${gymName} membership fee is overdue.\nYour membership expired on ${formattedExpiry}.\n\nPlease renew your membership to continue your training.\n\nThank you.`;
  } else {
    message = `Hi ${memberName},\n\nYour ${gymName} membership is due to expire on ${formattedExpiry}.\n\nPlease renew your membership to continue your training.\n\nThank you.`;
  }

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;

  return {
    url,
    message,
    isValidPhone: true,
    normalizedPhone,
  };
}

