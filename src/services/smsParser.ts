import {ParsedTransaction} from '../types';

// Bank sender patterns for identification
const BANK_PATTERNS = [
  /^AXISBK$/i,
  /^HDFCBK$/i,
  /^ICICIB$/i,
  /^SBIIN$/i,
  /^PNBSMS$/i,
  /^KOTAKB$/i,
  /^YESBNK$/i,
  /^INDUSB$/i,
  /^SCBANK$/i,
  /^CITIBANK$/i,
  /^BOIIND$/i,
  /^UNIONBK$/i,
  /^CANBNK$/i,
];

// Bank name mapping from sender ID
const BANK_NAME_MAP: Record<string, string> = {
  AXISBK: 'Axis Bank',
  HDFCBK: 'HDFC Bank',
  ICICIB: 'ICICI Bank',
  SBIIN: 'State Bank of India',
  PNBSMS: 'Punjab National Bank',
  KOTAKB: 'Kotak Mahindra Bank',
  YESBNK: 'Yes Bank',
  INDUSB: 'IndusInd Bank',
  SCBANK: 'Standard Chartered',
  CITIBANK: 'Citibank',
  BOIIND: 'Bank of India',
  UNIONBK: 'Union Bank',
  CANBNK: 'Canara Bank',
};

// Amount extraction patterns
const AMOUNT_PATTERNS = [
  /(?:Rs\.?|INR|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
  /(?:debited|credited|spent|paid)\s+(?:Rs\.?|INR|₹)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
  /(?:amount|amt)[\s:]+(?:Rs\.?|INR|₹)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
  /(?:of|for)\s+(?:Rs\.?|INR|₹)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
];

// Transaction type keywords
const DEBIT_KEYWORDS = [
  'debited',
  'spent',
  'paid',
  'withdrawn',
  'purchase',
  'debit',
  'deducted',
  'charged',
];

const CREDIT_KEYWORDS = [
  'credited',
  'received',
  'deposited',
  'refund',
  'credit',
  'added',
];

// Date extraction patterns
const DATE_PATTERNS = [
  /(\d{2})-(\d{2})-(\d{4})/,
  /(\d{2})\/(\d{2})\/(\d{4})/,
  /(\d{2})\.(\d{2})\.(\d{4})/,
  /on\s+(\d{2})-(\d{2})-(\d{4})/i,
  /on\s+(\d{2})\/(\d{2})\/(\d{4})/i,
];

/**
 * Check if the sender is a bank
 */
export function isBankSMS(sender: string): boolean {
  const normalizedSender = sender.toUpperCase().trim();
  return BANK_PATTERNS.some(pattern => pattern.test(normalizedSender));
}

/**
 * Get bank name from sender ID
 */
export function getBankName(sender: string): string {
  const normalizedSender = sender.toUpperCase().trim();
  return BANK_NAME_MAP[normalizedSender] || sender;
}

/**
 * Extract amount from SMS text
 */
export function extractAmount(text: string): number | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Remove commas and parse as float
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  return null;
}

/**
 * Detect transaction type (debit or credit)
 */
export function extractType(text: string): 'debit' | 'credit' | null {
  const lowerText = text.toLowerCase();

  // Check for debit keywords
  const hasDebit = DEBIT_KEYWORDS.some(keyword => lowerText.includes(keyword));
  if (hasDebit) {
    return 'debit';
  }

  // Check for credit keywords
  const hasCredit = CREDIT_KEYWORDS.some(keyword =>
    lowerText.includes(keyword),
  );
  if (hasCredit) {
    return 'credit';
  }

  return null;
}

/**
 * Extract date from SMS text
 */
export function extractDate(text: string, fallbackDate: Date): Date {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      try {
        // Assuming DD-MM-YYYY or DD/MM/YYYY format
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
        const year = parseInt(match[3], 10);

        const extractedDate = new Date(year, month, day);
        if (!isNaN(extractedDate.getTime())) {
          return extractedDate;
        }
      } catch (error) {
        // Continue to next pattern
      }
    }
  }

  // Return fallback date if no valid date found
  return fallbackDate;
}

/**
 * Extract description from SMS text
 */
export function extractDescription(text: string): string {
  // Try to extract merchant/description after common keywords
  const descPatterns = [
    /(?:at|to|for)\s+([A-Za-z0-9\s]+?)(?:\s+on|\s+dated|\.|$)/i,
    /(?:purchase|payment)\s+(?:at|to)\s+([A-Za-z0-9\s]+?)(?:\s+on|\.|$)/i,
  ];

  for (const pattern of descPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // If no specific description found, return truncated SMS body
  return text.substring(0, 100).trim();
}

/**
 * Parse SMS message and extract transaction data
 */
export function parseSMS(
  smsBody: string,
  sender: string,
  smsDate: Date,
): ParsedTransaction | null {
  // Check if it's a bank SMS
  if (!isBankSMS(sender)) {
    return null;
  }

  // Extract amount
  const amount = extractAmount(smsBody);
  if (!amount) {
    return null;
  }

  // Extract transaction type
  const type = extractType(smsBody);
  if (!type) {
    return null;
  }

  // Extract date (fallback to SMS date)
  const date = extractDate(smsBody, smsDate);

  // Get bank name
  const bankName = getBankName(sender);

  // Extract description
  const description = extractDescription(smsBody);

  return {
    amount,
    type,
    date,
    bankName,
    description,
  };
}
