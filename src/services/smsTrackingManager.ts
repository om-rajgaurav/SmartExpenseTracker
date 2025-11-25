import {initializeSMSAutoTracking} from './smsAutoTracker';
import {Transaction} from '../types';

// Global SMS tracking cleanup function
let smsCleanup: (() => void) | null = null;

/**
 * Start global SMS tracking
 */
export async function startGlobalSMSTracking(
  onTransactionCreated?: (transaction: Transaction) => void,
): Promise<boolean> {
  try {
    // Stop existing tracking if any
    if (smsCleanup) {
      console.log('Stopping existing SMS tracking...');
      smsCleanup();
      smsCleanup = null;
    }

    // Initialize new tracking
    console.log('Starting global SMS tracking...');
    const cleanup = await initializeSMSAutoTracking(onTransactionCreated);

    if (cleanup) {
      smsCleanup = cleanup;
      console.log('✅ Global SMS tracking started successfully');
      return true;
    } else {
      console.log('⚠️ Failed to start global SMS tracking');
      return false;
    }
  } catch (error) {
    console.error('Error starting global SMS tracking:', error);
    return false;
  }
}

/**
 * Stop global SMS tracking
 */
export function stopGlobalSMSTracking(): void {
  if (smsCleanup) {
    console.log('Stopping global SMS tracking...');
    smsCleanup();
    smsCleanup = null;
  }
}

/**
 * Check if SMS tracking is active
 */
export function isSMSTrackingActive(): boolean {
  return smsCleanup !== null;
}
