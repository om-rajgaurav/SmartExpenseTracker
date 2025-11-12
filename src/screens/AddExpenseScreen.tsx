import React from 'react';
import {View, StyleSheet, Alert, KeyboardAvoidingView, Platform} from 'react-native';
import {Snackbar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {ExpenseForm} from '../components/ExpenseForm';
import {addTransaction, loadTransactions} from '../store/transactionSlice';
import {Transaction, Category} from '../types';
import {theme} from '../theme/theme';
import {AppDispatch, RootState} from '../store';

interface ExpenseFormValues {
  category: Category | '';
  amount: string;
  date: Date;
  notes: string;
}

export const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {loading} = useSelector((state: RootState) => state.transactions);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  // Simple UUID generator that works without crypto
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async (values: ExpenseFormValues, resetForm: () => void) => {
    console.log('Form submitted with values:', values);
    
    try {
      const now = new Date();
      // Ensure dates are proper Date objects
      const transaction: Transaction = {
        id: generateId(),
        amount: parseFloat(values.amount),
        type: 'debit',
        category: values.category as Category,
        date: new Date(values.date), // Ensure it's a Date object
        description: `Manual ${values.category} expense`,
        source: 'manual',
        notes: values.notes || undefined,
        createdAt: new Date(now), // Ensure it's a Date object
        updatedAt: new Date(now), // Ensure it's a Date object
      };

      console.log('Adding transaction:', transaction);
      await dispatch(addTransaction(transaction)).unwrap();
      
      console.log('Transaction added, reloading...');
      await dispatch(loadTransactions()).unwrap();

      // Reset form to initial state
      resetForm();
      
      setSnackbarMessage('Expense added successfully!');
      setSnackbarVisible(true);

      // Navigate to Dashboard tab after a short delay
      setTimeout(() => {
        navigation.navigate('Dashboard' as never);
      }, 1500);
    } catch (err) {
      console.error('Error adding expense:', err);
      Alert.alert(
        'Error',
        `Failed to add expense: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{text: 'OK'}],
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.content}>
        <ExpenseForm onSubmit={handleSubmit} loading={loading} />

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          style={styles.snackbar}>
          {snackbarMessage}
        </Snackbar>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  snackbar: {
    backgroundColor: theme.colors.success,
  },
});
