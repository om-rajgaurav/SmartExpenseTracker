import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Transaction, TransactionFilters} from '../types';
import * as db from '../db/database';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  filters: TransactionFilters;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  filters: {},
  error: null,
};

// Async thunks
export const loadTransactions = createAsyncThunk(
  'transactions/loadTransactions',
  async (filters?: TransactionFilters) => {
    const transactions = await db.getTransactions(filters);
    return transactions;
  },
);

export const addTransaction = createAsyncThunk(
  'transactions/addTransaction',
  async (transaction: Transaction) => {
    await db.addTransaction(transaction);
    return transaction;
  },
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({id, data}: {id: string; data: Partial<Transaction>}) => {
    await db.updateTransaction(id, data);
    return {id, data};
  },
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: string) => {
    await db.deleteTransaction(id);
    return id;
  },
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: state => {
      state.filters = {};
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Load transactions
    builder.addCase(loadTransactions.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loadTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.transactions = action.payload;
    });
    builder.addCase(loadTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to load transactions';
    });

    // Add transaction
    builder.addCase(addTransaction.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addTransaction.fulfilled, (state, action) => {
      state.loading = false;
      state.transactions.unshift(action.payload);
    });
    builder.addCase(addTransaction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to add transaction';
    });

    // Update transaction
    builder.addCase(updateTransaction.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTransaction.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.transactions.findIndex(
        t => t.id === action.payload.id,
      );
      if (index !== -1) {
        state.transactions[index] = {
          ...state.transactions[index],
          ...action.payload.data,
          updatedAt: new Date(),
        };
      }
    });
    builder.addCase(updateTransaction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update transaction';
    });

    // Delete transaction
    builder.addCase(deleteTransaction.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTransaction.fulfilled, (state, action) => {
      state.loading = false;
      state.transactions = state.transactions.filter(
        t => t.id !== action.payload,
      );
    });
    builder.addCase(deleteTransaction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete transaction';
    });
  },
});

export const {setTransactions, setLoading, setFilters, clearFilters, clearError} =
  transactionSlice.actions;

export default transactionSlice.reducer;
