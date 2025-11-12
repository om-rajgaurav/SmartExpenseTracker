import {configureStore} from '@reduxjs/toolkit';
import transactionReducer from './transactionSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionReducer,
    settings: settingsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'transactions/loadTransactions/fulfilled',
          'transactions/addTransaction/pending',
          'transactions/addTransaction/fulfilled',
          'transactions/updateTransaction/pending',
          'transactions/updateTransaction/fulfilled',
          'transactions/deleteTransaction/pending',
          'transactions/deleteTransaction/fulfilled',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.date',
          'payload.createdAt',
          'payload.updatedAt',
          'meta.arg.date',
          'meta.arg.createdAt',
          'meta.arg.updatedAt',
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'transactions.transactions',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
