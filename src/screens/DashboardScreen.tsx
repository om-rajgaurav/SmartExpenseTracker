import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Text, FAB, Snackbar, Card, Button} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RootState, AppDispatch} from '../store';
import {loadTransactions} from '../store/transactionSlice';
import {BalanceCard} from '../components/BalanceCard';
import {CategoryChart} from '../components/CategoryChart';
import {TransactionCard} from '../components/TransactionCard';
import {colors, typography} from '../theme/theme';
import {getMonthString} from '../utils/helpers';
import * as db from '../db/database';
import {Category} from '../types';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {transactions, loading, error} = useSelector(
    (state: RootState) => state.transactions,
  );
  const {hasSMSPermission} = useSelector(
    (state: RootState) => state.settings,
  );

  const [balance, setBalance] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<Category, number>>(
    {} as Record<Category, number>,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSMSBanner, setShowSMSBanner] = useState(true);

  const loadDashboardData = async () => {
    try {
      // Load transactions
      await dispatch(loadTransactions()).unwrap();

      // Load balance
      const totalBalance = await db.getTotalBalance();
      setBalance(totalBalance);

      // Load monthly expenses for current month
      const currentMonth = getMonthString(new Date());
      const expenses = await db.getMonthlyExpenses(currentMonth);
      setMonthlyExpenses(expenses);

      // Load category totals
      const totals = await db.getCategoryTotals();
      setCategoryTotals(totals);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setSnackbarMessage('Failed to load dashboard data. Please try again.');
      setSnackbarVisible(true);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload data when screen comes into focus (e.g., after adding expense)
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
    }
  }, [error]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const recentTransactions = transactions.slice(0, 5);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="wallet-outline" size={80} color={colors.disabled} />
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyText}>
        Start tracking your expenses by adding your first transaction or grant
        SMS permissions to auto-track.
      </Text>
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }>
        {!hasSMSPermission && showSMSBanner && Platform.OS === 'android' && (
          <Card style={styles.smsBanner}>
            <Card.Content>
              <View style={styles.bannerContent}>
                <View style={styles.bannerTextContainer}>
                  <Text variant="titleSmall" style={styles.bannerTitle}>
                    📱 Enable SMS Auto-Tracking
                  </Text>
                  <Text variant="bodySmall" style={styles.bannerDescription}>
                    Automatically track expenses from bank SMS messages
                  </Text>
                </View>
                <View style={styles.bannerActions}>
                  <Button
                    mode="text"
                    onPress={() => setShowSMSBanner(false)}
                    compact
                    textColor={colors.onSurface}>
                    Dismiss
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Settings')}
                    compact
                    style={styles.enableButton}>
                    Enable
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        
        {transactions.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <BalanceCard balance={balance} monthlyExpenses={monthlyExpenses} />

            <CategoryChart categoryTotals={categoryTotals} />

            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {transactions.length > 5 && (
                  <Text
                    style={styles.viewAll}
                    onPress={() => navigation.navigate('History')}>
                    View All
                  </Text>
                )}
              </View>

              {recentTransactions.map(transaction => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() => {
                    // Navigate to transaction detail if needed
                    console.log('Transaction pressed:', transaction.id);
                  }}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
        label="Add Expense"
      />

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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.bodyLarge,
    color: colors.onSurface,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 24,
  },
  recentSection: {
    marginTop: 8,
    marginBottom: 80,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    ...typography.titleLarge,
    color: colors.onSurface,
  },
  viewAll: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.primary,
  },
  smsBanner: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: colors.primary + '15',
    elevation: 2,
  },
  bannerContent: {
    flexDirection: 'column',
  },
  bannerTextContainer: {
    marginBottom: 12,
  },
  bannerTitle: {
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 4,
  },
  bannerDescription: {
    color: colors.onSurface,
    opacity: 0.7,
  },
  bannerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  enableButton: {
    marginLeft: 8,
  },
});
