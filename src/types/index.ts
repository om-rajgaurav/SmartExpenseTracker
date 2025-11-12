export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Others';

export interface Transaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  category: Category;
  date: Date;
  description: string;
  bankName?: string;
  source: 'sms' | 'manual';
  smsId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SMSData {
  id: string;
  sender: string;
  body: string;
  date: Date;
  parsed: boolean;
  transactionId?: string;
}

export interface TransactionFilters {
  month?: string; // YYYY-MM format
  category?: Category;
  bank?: string;
}

export interface ParsedTransaction {
  amount: number;
  type: 'debit' | 'credit';
  date: Date;
  bankName: string;
  description: string;
}

export interface AppSettings {
  hasCompletedOnboarding: boolean;
  hasSMSPermission: boolean;
  currency: string;
}
