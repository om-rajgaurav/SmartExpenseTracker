import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  FAB,
  Chip,
  ActivityIndicator,
  Portal,
  Dialog,
  Button,
  Snackbar,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {Swipeable} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RootState, AppDispatch} from '../store';
import {
  loadTransactions,
  deleteTransaction,
  setFilters,
  clearFilters,
} from '../store/transactionSlice';
import {Transaction, TransactionFilters} from '../types';
import {TransactionCard} from '../components/TransactionCard';
import {FilterModal} from '../components/FilterModal';
import {colors, typography} from '../theme/theme';

export const TransactionHistoryScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {transactions, loading, filters, error} = useSelector(
    (state: RootState) => state.transactions,
  );

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<
    string | null
  >(null);
  const swipeableRefs = useRef<Map<string, Swipeable | null>>(new Map());
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    dispatch(loadTransactions(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadTransactions(filters)).unwrap();
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      setSnackbarMessage('Failed to refresh transactions');
      setSnackbarVisible(true);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, filters]);

  const availableBanks = Array.from(
    new Set(
      transactions
        .filter(t => t.bankName)
        .map(t => t.bankName as string),
    ),
  );

  const handleApplyFilters = useCallback(
    (newFilters: TransactionFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch],
  );

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const handleDeletePress = useCallback((id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (transactionToDelete) {
      try {
        await dispatch(deleteTransaction(transactionToDelete)).unwrap();
        setSnackbarMessage('Transaction deleted successfully');
        setSnackbarVisible(true);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        setSnackbarMessage('Failed to delete transaction');
        setSnackbarVisible(true);
      }
      setDeleteDialogVisible(false);
      setTransactionToDelete(null);
    }
  }, [dispatch, transactionToDelete]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogVisible(false);
    setTransactionToDelete(null);
  }, []);

  const handleEditPress = useCallback(
    (transaction: Transaction) => {
      // Close the swipeable row
      const swipeable = swipeableRefs.current.get(transaction.id);
      if (swipeable) {
        swipeable.close();
      }
      
      // TODO: Navigate to edit screen when implemented
      Alert.alert(
        'Edit Transaction',
        'Edit functionality will be implemented in a future update.',
      );
    },
    [],
  );

  const renderRightActions = useCallback(
    (transaction: Transaction) => {
      return (
        <View style={styles.swipeActions}>
          <TouchableOpacity
            style={[styles.swipeAction, styles.editAction]}
            onPress={() => handleEditPress(transaction)}>
            <Icon name="pencil" size={24} color={colors.onPrimary} />
            <Text style={styles.swipeActionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeAction, styles.deleteAction]}
            onPress={() => handleDeletePress(transaction.id)}>
            <Icon name="delete" size={24} color={colors.onError} />
            <Text style={styles.swipeActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [handleDeletePress, handleEditPress],
  );

  const renderTransaction = useCallback(
    ({item}: {item: Transaction}) => {
      return (
        <Swipeable
          ref={ref => {
            if (ref) {
              swipeableRefs.current.set(item.id, ref);
            } else {
              swipeableRefs.current.delete(item.id);
            }
          }}
          renderRightActions={() => renderRightActions(item)}
          overshootRight={false}
          friction={2}>
          <TransactionCard transaction={item} />
        </Swipeable>
      );
    },
    [renderRightActions],
  );

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    const hasFilters =
      filters.month || filters.category || filters.bank;

    return (
      <View style={styles.emptyContainer}>
        <Icon
          name={hasFilters ? 'filter-off' : 'receipt-text-outline'}
          size={64}
          color={colors.disabled}
        />
        <Text style={styles.emptyTitle}>
          {hasFilters ? 'No Matching Transactions' : 'No Transactions Yet'}
        </Text>
        <Text style={styles.emptyMessage}>
          {hasFilters
            ? 'Try adjusting your filters to see more results'
            : 'Start tracking your expenses by adding your first transaction'}
        </Text>
        {hasFilters && (
          <Button
            mode="contained"
            onPress={handleClearFilters}
            style={styles.clearFiltersButton}>
            Clear Filters
          </Button>
        )}
      </View>
    );
  };

  const renderHeader = () => {
    const hasFilters =
      filters.month || filters.category || filters.bank;

    if (!hasFilters && transactions.length === 0) {
      return null;
    }

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.transactionCount}>
            {transactions.length}{' '}
            {transactions.length === 1 ? 'Transaction' : 'Transactions'}
          </Text>
        </View>

        {hasFilters && (
          <View style={styles.filterChips}>
            {filters.month && (
              <Chip
                icon="calendar"
                onClose={() =>
                  handleApplyFilters({...filters, month: undefined})
                }
                style={styles.filterChip}>
                {filters.month}
              </Chip>
            )}
            {filters.category && (
              <Chip
                icon="tag"
                onClose={() =>
                  handleApplyFilters({...filters, category: undefined})
                }
                style={styles.filterChip}>
                {filters.category}
              </Chip>
            )}
            {filters.bank && (
              <Chip
                icon="bank"
                onClose={() =>
                  handleApplyFilters({...filters, bank: undefined})
                }
                style={styles.filterChip}>
                {filters.bank}
              </Chip>
            )}
            <Chip
              icon="close"
              onPress={handleClearFilters}
              style={styles.clearAllChip}
              textStyle={styles.clearAllChipText}>
              Clear All
            </Chip>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading && transactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            transactions.length === 0 ? styles.emptyList : styles.list
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <FAB
        icon="filter"
        style={styles.fab}
        onPress={() => setFilterModalVisible(true)}
        label="Filter"
      />

      <FilterModal
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
        availableBanks={availableBanks}
      />

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={handleCancelDelete}>
          <Dialog.Title>Delete Transaction</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelDelete}>Cancel</Button>
            <Button onPress={handleConfirmDelete} textColor={colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionCount: {
    ...typography.titleMedium,
    fontWeight: '600',
    color: colors.onSurface,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  clearAllChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.error + '20',
  },
  clearAllChipText: {
    color: colors.error,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  editAction: {
    backgroundColor: colors.primary,
  },
  deleteAction: {
    backgroundColor: colors.error,
  },
  swipeActionText: {
    ...typography.labelSmall,
    color: colors.onPrimary,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...typography.headlineSmall,
    fontWeight: '600',
    color: colors.onSurface,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.primary,
  },
});
