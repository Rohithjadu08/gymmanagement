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
 * Generate WhatsApp click-to-chat URL with pre-filled reminder template
 */
export function generateWhatsAppReminderUrl({
  phone,
  memberName,
  expiryDate,
  isOverdue,
  gymName = 'Iron Pulse Gym',
}: {
  phone: string;
  memberName: string;
  expiryDate: string;
  isOverdue: boolean;
  gymName?: string;
}): { url: string; message: string } {
  // Clean phone number
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const formattedExpiry = formatDate(expiryDate);

  let message = '';
  if (isOverdue) {
    message = `Hi ${memberName},\n\nYour ${gymName} membership fee is overdue.\nYour membership expired on ${formattedExpiry}.\n\nPlease renew your membership to continue your training.\n\nThank you.`;
  } else {
    message = `Hi ${memberName},\n\nYour ${gymName} membership is due to expire on ${formattedExpiry}.\n\nPlease renew your membership to continue your training.\n\nThank you.`;
  }

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  return { url, message };
}
