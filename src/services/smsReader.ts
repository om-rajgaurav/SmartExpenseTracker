import {Platform, PermissionsAndroid} from 'react-native';
import {SMSData} from '../types';

// Type definitions for react-native-android-sms-listener
interface SMSMessage {
  originatingAddress: string;
  body: string;
  timestamp: number;
}

interface CancellableSubscription {
  remove: () => void;
}

// Dynamic import for Android-only module
let SmsListener: {
  addListener: (callback: (message: SMSMessage) => void) => CancellableSubscription;
} | null = null;

if (Platform.OS === 'android') {
  try {
    SmsListener = require('react-native-android-sms-listener').default;
  } catch (error) {
    console.warn('SMS Listener not available:', error);
  }
}

/**
 * Request SMS read permission from the user
 */
export async function requestSMSPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    console.log('SMS permissions not available on iOS');
    return false;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message:
          'Smart Expense Tracker needs access to your SMS messages to automatically track expenses from bank notifications.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('SMS permission granted');
      return true;
    } else {
      console.log('SMS permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting SMS permission:', error);
    return false;
  }
}

/**
 * Request RECEIVE_SMS permission for listening to new messages
 */
export async function requestReceiveSMSPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      {
        title: 'Receive SMS Permission',
        message:
          'Smart Expense Tracker needs permission to receive SMS messages to track expenses in real-time.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.error('Error requesting RECEIVE_SMS permission:', error);
    return false;
  }
}

/**
 * Check if SMS read permission is granted
 */
export async function hasSMSPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
    );
    return granted;
  } catch (error) {
    console.error('Error checking SMS permission:', error);
    return false;
  }
}

/**
 * Check if RECEIVE_SMS permission is granted
 */
export async function hasReceiveSMSPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    );
    return granted;
  } catch (error) {
    console.error('Error checking RECEIVE_SMS permission:', error);
    return false;
  }
}

/**
 * Read all SMS messages from the device
 * Uses native module to read SMS from Android content provider
 */
export async function readAllSMS(): Promise<SMSData[]> {
  if (Platform.OS !== 'android') {
    console.log('SMS reading not available on iOS');
    return [];
  }

  const hasPermission = await hasSMSPermission();
  if (!hasPermission) {
    console.log('SMS permission not granted');
    return [];
  }

  try {
    // Import native module for reading SMS
    const SmsAndroid = require('react-native-get-sms-android');

    return new Promise((resolve, reject) => {
      const filter = {
        box: 'inbox', // 'inbox', 'sent', 'draft', 'outbox', 'failed', 'queued'
        indexFrom: 0,
        maxCount: 1000, // Limit to last 1000 messages for performance
      };

      SmsAndroid.list(
        JSON.stringify(filter),
        (fail: string) => {
          console.error('Failed to read SMS:', fail);
          resolve([]); // Return empty array on failure
        },
        (count: number, smsList: string) => {
          try {
            const messages = JSON.parse(smsList);
            const smsData: SMSData[] = messages.map((msg: any) => ({
              id: msg._id.toString(),
              sender: msg.address || '',
              body: msg.body || '',
              date: new Date(parseInt(msg.date, 10)),
              parsed: false,
            }));

            console.log(`Successfully read ${smsData.length} SMS messages`);
            resolve(smsData);
          } catch (parseError) {
            console.error('Error parsing SMS data:', parseError);
            resolve([]);
          }
        },
      );
    });
  } catch (error) {
    console.error('Error reading SMS messages:', error);
    // If the library is not available, return empty array
    // This allows the app to function without SMS reading capability
    return [];
  }
}

/**
 * Start listening for new incoming SMS messages
 */
export function startSMSListener(
  callback: (sms: SMSData) => void,
): (() => void) | null {
  if (Platform.OS !== 'android') {
    console.log('SMS listener not available on iOS');
    return null;
  }

  if (!SmsListener) {
    console.warn('SMS Listener module not available');
    return null;
  }

  try {
    const subscription = SmsListener.addListener((message: SMSMessage) => {
      console.log('SMS received from:', message.originatingAddress);
      
      const smsData: SMSData = {
        id: `${message.timestamp}`, // Use timestamp as ID
        sender: message.originatingAddress,
        body: message.body,
        date: new Date(message.timestamp),
        parsed: false,
      };

      callback(smsData);
    });

    console.log('SMS listener started successfully');

    // Return cleanup function
    return () => {
      try {
        subscription.remove();
        console.log('SMS listener stopped');
      } catch (error) {
        console.error('Error stopping SMS listener:', error);
      }
    };
  } catch (error) {
    console.error('Error starting SMS listener:', error);
    return null;
  }
}

/**
 * Request all necessary SMS permissions
 */
export async function requestAllSMSPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  const readPermission = await requestSMSPermission();
  const receivePermission = await requestReceiveSMSPermission();

  return readPermission && receivePermission;
}
