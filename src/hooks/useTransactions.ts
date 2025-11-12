import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { AppDispatch, RootState } from '../store';
import {
  loadTransactions,
  addTransaction as addTransactionAction,
  updateTransaction as updateTransactionAction,
  deleteTransaction as deleteTransactionAction,
  setFilters,
  clearFilters,
} from '../store/transactionSlice';
import { Transaction, TransactionFilters } from '../types';

export const useTransactions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading, filters } = useSelector(
    (state: RootState) => state.transactions
  );

  useEffect(() => {
    dispatch(loadTransactions());
  }, [dispatch]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const fullTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await dispatch(addTransactionAction(fullTransaction));
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    await dispatch(updateTransactionAction({ id, data }));
  };

  const deleteTransaction = async (id: string) => {
    await dispatch(deleteTransactionAction(id));
  };

  const applyFilters = (newFilters: TransactionFilters) => {
    dispatch(setFilters(newFilters));
  };

  const resetFilters = () => {
    dispatch(clearFilters());
  };

  return {
    transactions,
    loading,
    filters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    applyFilters,
    resetFilters,
  };
};
