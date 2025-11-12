import {SMSData, Transaction, Category} from '../types';

// Simple UUID generator that works without crypto
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
import {parseSMS} from './smsParser';
import {
  readAllSMS,
  startSMSListener,
  hasSMSPermission,
} from './smsReader';
import {
  addTransaction,
  storeSMS,
  isSMSParsed,
  markSMSAsParsed,
} from '../db/database';

// Category mapping based on keywords in description
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Food: ['restaurant', 'cafe', 'food', 'swiggy', 'zomato', 'dominos', 'pizza', 'mcdonald'],
  Transport: ['uber', 'ola', 'petrol', 'fuel', 'metro', 'taxi', 'bus', 'rapido'],
  Shopping: ['amazon', 'flipkart', 'mall', 'store', 'shop', 'myntra', 'ajio'],
  Bills: ['electricity', 'water', 'gas', 'internet', 'mobile', 'recharge', 'bill'],
  Entertainment: ['movie', 'netflix', 'spotify', 'prime', 'hotstar', 'cinema'],
  Healthcare: ['hospital', 'pharmacy', 'doctor', 'medical', 'clinic', 'apollo'],
  Others: [],
};

/**
 * Determine category based on transaction description
 */
function determineCategory(description: string): Category {
  const lowerDesc = description.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category as Category;
    }
  }

  return 'Others';
}

/**
 * Process a single SMS message and create transaction if valid
 */
async function processSMS(sms: SMSData): Promise<boolean> {
  try {
    // Check if SMS already parsed
    const alreadyParsed = await isSMSParsed(sms.id);
    if (alreadyParsed) {
      console.log(`SMS ${sms.id} already parsed, skipping`);
      return false;
    }

    // Store SMS in database
    await storeSMS(sms.id, sms.sender, sms.body, sms.date, false);

    // Parse SMS
    const parsedData = parseSMS(sms.body, sms.sender, sms.date);
    if (!parsedData) {
      console.log(`SMS ${sms.id} could not be parsed`);
      return false;
    }

    // Determine category
    const category = determineCategory(parsedData.description);

    // Create transaction
    const transaction: Transaction = {
      id: generateId(),
      amount: parsedData.amount,
      type: parsedData.type,
      category,
      date: parsedData.date,
      description: parsedData.description,
      bankName: parsedData.bankName,
      source: 'sms',
      smsId: sms.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save transaction to database
    await addTransaction(transaction);

    // Mark SMS as parsed
    await markSMSAsParsed(sms.id, transaction.id);

    console.log(`Transaction created from SMS ${sms.id}: ${transaction.id}`);
    return true;
  } catch (error) {
    console.error(`Error processing SMS ${sms.id}:`, error);
    return false;
  }
}

/**
 * Process all existing SMS messages
 */
export async function processExistingSMS(): Promise<number> {
  try {
    const hasPermission = await hasSMSPermission();
    if (!hasPermission) {
      console.log('SMS permission not granted, skipping existing SMS processing');
      return 0;
    }

    console.log('Reading all existing SMS messages...');
    const allSMS = await readAllSMS();
    console.log(`Found ${allSMS.length} SMS messages`);

    let processedCount = 0;
    for (const sms of allSMS) {
      const success = await processSMS(sms);
      if (success) {
        processedCount++;
      }
    }

    console.log(`Processed ${processedCount} transactions from existing SMS`);
    return processedCount;
  } catch (error) {
    console.error('Error processing existing SMS:', error);
    return 0;
  }
}

/**
 * Start listening for new incoming SMS messages
 */
export function startSMSAutoTracking(
  onTransactionCreated?: (transaction: Transaction) => void,
): (() => void) | null {
  console.log('Starting SMS auto-tracking...');

  const cleanup = startSMSListener(async (sms: SMSData) => {
    console.log(`New SMS received from ${sms.sender}`);

    try {
      // Check if SMS already parsed
      const alreadyParsed = await isSMSParsed(sms.id);
      if (alreadyParsed) {
        console.log(`SMS ${sms.id} already parsed, skipping`);
        return;
      }

      // Store SMS in database
      await storeSMS(sms.id, sms.sender, sms.body, sms.date, false);

      // Parse SMS
      const parsedData = parseSMS(sms.body, sms.sender, sms.date);
      if (!parsedData) {
        console.log(`SMS ${sms.id} could not be parsed (not a bank SMS)`);
        return;
      }

      // Determine category
      const category = determineCategory(parsedData.description);

      // Create transaction
      const transaction: Transaction = {
        id: generateId(),
        amount: parsedData.amount,
        type: parsedData.type,
        category,
        date: parsedData.date,
        description: parsedData.description,
        bankName: parsedData.bankName,
        source: 'sms',
        smsId: sms.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save transaction to database
      await addTransaction(transaction);

      // Mark SMS as parsed
      await markSMSAsParsed(sms.id, transaction.id);

      console.log(`Transaction created from new SMS: ${transaction.id}`);

      // Notify callback
      if (onTransactionCreated) {
        onTransactionCreated(transaction);
      }
    } catch (error) {
      console.error(`Error processing new SMS ${sms.id}:`, error);
    }
  });

  if (cleanup) {
    console.log('SMS auto-tracking started successfully');
  } else {
    console.log('Failed to start SMS auto-tracking');
  }

  return cleanup;
}

/**
 * Initialize SMS auto-tracking
 * - Process existing SMS on first permission grant
 * - Start listener for new SMS
 */
export async function initializeSMSAutoTracking(
  onTransactionCreated?: (transaction: Transaction) => void,
): Promise<(() => void) | null> {
  try {
    const hasPermission = await hasSMSPermission();
    if (!hasPermission) {
      console.log('SMS permission not granted, SMS auto-tracking disabled');
      return null;
    }

    // Process existing SMS
    await processExistingSMS();

    // Start listening for new SMS
    const cleanup = startSMSAutoTracking(onTransactionCreated);

    return cleanup;
  } catch (error) {
    console.error('Error initializing SMS auto-tracking:', error);
    return null;
  }
}
