import { format, parseISO } from 'date-fns';

/**
 * Format currency amount with symbol and proper formatting
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'INR')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'INR'
): string => {
  const formattedAmount = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  switch (currency) {
    case 'INR':
      return `₹${formattedAmount}`;
    case 'USD':
      return `$${formattedAmount}`;
    case 'EUR':
      return `€${formattedAmount}`;
    case 'GBP':
      return `£${formattedAmount}`;
    default:
      return `${currency} ${formattedAmount}`;
  }
};

/**
 * Format date to display format
 * @param date - Date to format (Date object or ISO string)
 * @param formatString - Format string (default: 'dd MMM yyyy')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  formatString: string = 'dd MMM yyyy'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

/**
 * Format date and time to display format
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd MMM yyyy, hh:mm a');
};

/**
 * Format date to month-year format
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted month-year string (e.g., "Jan 2024")
 */
export const formatMonthYear = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM yyyy');
};

/**
 * Get month in YYYY-MM format for filtering
 * @param date - Date to format (Date object or ISO string)
 * @returns Month string in YYYY-MM format
 */
export const getMonthString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM');
};

/**
 * Parse amount string and remove formatting
 * @param amountString - Amount string with possible formatting
 * @returns Parsed number
 */
export const parseAmount = (amountString: string): number => {
  // Remove currency symbols, commas, and spaces
  const cleaned = amountString.replace(/[₹$€£,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Validate if a string is a valid positive number
 * @param value - String to validate
 * @returns True if valid positive number
 */
export const isValidAmount = (value: string): boolean => {
  const amount = parseAmount(value);
  return !isNaN(amount) && amount > 0;
};

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Get initials from text (for avatars)
 * @param text - Text to get initials from
 * @returns Initials (max 2 characters)
 */
export const getInitials = (text: string): string => {
  const words = text.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};
