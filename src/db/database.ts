import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';
import {Transaction, TransactionFilters, Category, SMSData} from '../types';

SQLite.enablePromise(true);

let db: SQLiteDatabase | null = null;

/**
 * Initialize the SQLite database and create tables
 */
export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabase({
      name: 'expense_tracker.db',
      location: 'default',
    });

    // Create transactions table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('debit', 'credit')),
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        bank_name TEXT,
        source TEXT NOT NULL CHECK(source IN ('sms', 'manual')),
        sms_id TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Create indexes for better query performance
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_transactions_bank ON transactions(bank_name);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);',
    );

    // Create SMS messages table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS sms_messages (
        id TEXT PRIMARY KEY,
        sender TEXT NOT NULL,
        body TEXT NOT NULL,
        date TEXT NOT NULL,
        parsed INTEGER NOT NULL DEFAULT 0,
        transaction_id TEXT,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
      );
    `);

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_sms_sender ON sms_messages(sender);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_sms_parsed ON sms_messages(parsed);',
    );

    // Create settings table for budget and other app settings
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Add a new transaction to the database
 */
export async function addTransaction(transaction: Transaction): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    await db.executeSql(
      `INSERT INTO transactions (
        id, amount, type, category, date, description, 
        bank_name, source, sms_id, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.amount,
        transaction.type,
        transaction.category,
        transaction.date.toISOString(),
        transaction.description,
        transaction.bankName || null,
        transaction.source,
        transaction.smsId || null,
        transaction.notes || null,
        transaction.createdAt.toISOString(),
        transaction.updatedAt.toISOString(),
      ],
    );
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  id: string,
  data: Partial<Transaction>,
): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.amount !== undefined) {
      updates.push('amount = ?');
      values.push(data.amount);
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.date !== undefined) {
      updates.push('date = ?');
      values.push(data.date.toISOString());
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.bankName !== undefined) {
      updates.push('bank_name = ?');
      values.push(data.bankName);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    // Always update the updated_at timestamp
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(id);

    await db.executeSql(
      `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`,
      values,
    );
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

/**
 * Delete a transaction from the database
 */
export async function deleteTransaction(id: string): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    await db.executeSql('DELETE FROM transactions WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

/**
 * Get transactions with optional filters
 */
export async function getTransactions(
  filters?: TransactionFilters,
): Promise<Transaction[]> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params: any[] = [];

    if (filters?.month) {
      query += ' AND strftime("%Y-%m", date) = ?';
      params.push(filters.month);
    }

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.bank) {
      query += ' AND bank_name = ?';
      params.push(filters.bank);
    }

    query += ' ORDER BY date DESC';

    const [results] = await db.executeSql(query, params);
    const transactions: Transaction[] = [];

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      transactions.push({
        id: row.id,
        amount: row.amount,
        type: row.type,
        category: row.category,
        date: new Date(row.date),
        description: row.description,
        bankName: row.bank_name,
        source: row.source,
        smsId: row.sms_id,
        notes: row.notes,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });
    }

    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
}

/**
 * Get total balance (credits - debits)
 */
export async function getTotalBalance(): Promise<number> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const [results] = await db.executeSql(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as credits,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as debits
      FROM transactions
    `);

    const row = results.rows.item(0);
    return row.credits - row.debits;
  } catch (error) {
    console.error('Error getting total balance:', error);
    throw error;
  }
}

/**
 * Get monthly expenses for a specific month
 */
export async function getMonthlyExpenses(month: string): Promise<number> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const [results] = await db.executeSql(
      `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE type = 'debit' AND strftime("%Y-%m", date) = ?
    `,
      [month],
    );

    return results.rows.item(0).total;
  } catch (error) {
    console.error('Error getting monthly expenses:', error);
    throw error;
  }
}

/**
 * Get category totals for chart
 */
export async function getCategoryTotals(): Promise<Record<Category, number>> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const [results] = await db.executeSql(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE type = 'debit'
      GROUP BY category
    `);

    const totals: Record<string, number> = {};

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      totals[row.category] = row.total;
    }

    return totals as Record<Category, number>;
  } catch (error) {
    console.error('Error getting category totals:', error);
    throw error;
  }
}

/**
 * Store SMS message in database
 */
export async function storeSMS(
  id: string,
  sender: string,
  body: string,
  date: Date,
  parsed: boolean = false,
  transactionId?: string,
): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    await db.executeSql(
      `INSERT OR IGNORE INTO sms_messages (id, sender, body, date, parsed, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        sender,
        body,
        date.toISOString(),
        parsed ? 1 : 0,
        transactionId || null,
      ],
    );
  } catch (error) {
    console.error('Error storing SMS:', error);
    throw error;
  }
}

/**
 * Check if SMS has already been parsed
 */
export async function isSMSParsed(smsId: string): Promise<boolean> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const [results] = await db.executeSql(
      'SELECT id FROM sms_messages WHERE id = ? AND parsed = 1',
      [smsId],
    );
    return results.rows.length > 0;
  } catch (error) {
    console.error('Error checking SMS parsed status:', error);
    return false;
  }
}

/**
 * Mark SMS as parsed and link to transaction
 */
export async function markSMSAsParsed(
  smsId: string,
  transactionId: string,
): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    await db.executeSql(
      'UPDATE sms_messages SET parsed = 1, transaction_id = ? WHERE id = ?',
      [transactionId, smsId],
    );
  } catch (error) {
    console.error('Error marking SMS as parsed:', error);
    throw error;
  }
}

/**
 * Get monthly budget
 */
export async function getMonthlyBudget(): Promise<number> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const [results] = await db.executeSql(
      'SELECT value FROM settings WHERE key = ?',
      ['monthly_budget'],
    );

    if (results.rows.length > 0) {
      return parseFloat(results.rows.item(0).value);
    }
    return 0; // Default budget is 0 (not set)
  } catch (error) {
    console.error('Error getting monthly budget:', error);
    return 0;
  }
}

/**
 * Set monthly budget
 */
export async function setMonthlyBudget(amount: number): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    await db.executeSql(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['monthly_budget', amount.toString()],
    );
  } catch (error) {
    console.error('Error setting monthly budget:', error);
    throw error;
  }
}
