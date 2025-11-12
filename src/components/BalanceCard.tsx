import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {colors, typography} from '../theme/theme';
import {formatCurrency} from '../utils/helpers';

interface BalanceCardProps {
  balance: number;
  monthlyExpenses: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  monthlyExpenses,
}) => {
  return (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <View style={styles.container}>
          <View style={styles.section}>
            <Text style={styles.label}>Total Balance</Text>
            <Text
              style={[
                styles.amount,
                {color: balance >= 0 ? colors.success : colors.debit},
              ]}>
              {formatCurrency(balance)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.label}>Monthly Expenses</Text>
            <Text style={[styles.amount, {color: colors.debit}]}>
              {formatCurrency(monthlyExpenses)}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: colors.surface,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  section: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    opacity: 0.6,
    marginBottom: 8,
  },
  amount: {
    ...typography.headlineMedium,
    fontWeight: '600',
  },
});
