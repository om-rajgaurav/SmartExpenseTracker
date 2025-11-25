import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {colors, typography} from '../theme/theme';
import {formatCurrency} from '../utils/helpers';

interface BalanceCardProps {
  balance: number;
  monthlyExpenses: number;
  monthlyBudget?: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  monthlyExpenses,
  monthlyBudget = 0,
}) => {
  const budgetRemaining = monthlyBudget - monthlyExpenses;
  const budgetPercentage = monthlyBudget > 0 ? (monthlyExpenses / monthlyBudget) * 100 : 0;
  const isOverBudget = monthlyBudget > 0 && monthlyExpenses > monthlyBudget;

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
            {monthlyBudget > 0 && (
              <Text style={styles.budgetInfo}>
                of {formatCurrency(monthlyBudget)} budget
              </Text>
            )}
          </View>
        </View>
        
        {monthlyBudget > 0 && (
          <View style={styles.budgetSection}>
            <View style={styles.budgetBar}>
              <View
                style={[
                  styles.budgetProgress,
                  {
                    width: `${Math.min(budgetPercentage, 100)}%`,
                    backgroundColor: isOverBudget ? colors.error : colors.success,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.budgetText,
                {color: isOverBudget ? colors.error : colors.success},
              ]}>
              {isOverBudget
                ? `Over budget by ${formatCurrency(Math.abs(budgetRemaining))}`
                : `${formatCurrency(budgetRemaining)} remaining`}
            </Text>
          </View>
        )}
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
  budgetInfo: {
    ...typography.bodySmall,
    color: colors.onSurface,
    opacity: 0.5,
    marginTop: 4,
  },
  budgetSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  budgetBar: {
    height: 8,
    backgroundColor: colors.disabled + '30',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  budgetProgress: {
    height: '100%',
    borderRadius: 4,
  },
  budgetText: {
    ...typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },
});
