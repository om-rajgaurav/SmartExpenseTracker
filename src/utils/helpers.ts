import { format, parseISO } from 'date-fns';


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


export const formatDate = (
  date: Date | string,
  formatString: string = 'dd MMM yyyy'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};


export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd MMM yyyy, hh:mm a');
};


export const formatMonthYear = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM yyyy');
};


export const getMonthString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM');
};


export const parseAmount = (amountString: string): number => {
  // Remove currency symbols, commas, and spaces
  const cleaned = amountString.replace(/[₹$€£,\s]/g, '');
  return parseFloat(cleaned) || 0;
};


export const isValidAmount = (value: string): boolean => {
  const amount = parseAmount(value);
  return !isNaN(amount) && amount > 0;
};


export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};


export const getInitials = (text: string): string => {
  const words = text.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};
