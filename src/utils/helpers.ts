import { format, parseISO } from 'date-fns';


export const formatCurrency = (
  amount: number,
  currency: string = 'INR'
): string => {
  try {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₹0.00';
    }
    
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
  } catch (error) {
    console.error('Error formatting currency:', error, amount);
    return '₹0.00';
  }
};


export const formatDate = (
  date: Date | string,
  formatString: string = 'dd MMM yyyy'
): string => {
  try {
    if (!date) {
      return 'Invalid Date';
    }
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Invalid Date';
  }
};


export const formatDateTime = (date: Date | string): string => {
  try {
    if (!date) {
      return 'Invalid Date';
    }
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return format(dateObj, 'dd MMM yyyy, hh:mm a');
  } catch (error) {
    console.error('Error formatting date time:', error, date);
    return 'Invalid Date';
  }
};


export const formatMonthYear = (date: Date | string): string => {
  try {
    if (!date) {
      return 'Invalid Date';
    }
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return format(dateObj, 'MMM yyyy');
  } catch (error) {
    console.error('Error formatting month year:', error, date);
    return 'Invalid Date';
  }
};


export const getMonthString = (date: Date | string): string => {
  try {
    if (!date) {
      return '';
    }
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    return format(dateObj, 'yyyy-MM');
  } catch (error) {
    console.error('Error getting month string:', error, date);
    return '';
  }
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
