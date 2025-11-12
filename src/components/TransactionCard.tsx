import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Transaction, Category} from '../types';
import {colors, typography} from '../theme/theme';
import {formatCurrency, formatDate} from '../utils/helpers';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

const getCategoryIcon = (category: Category): string => {
  const iconMap: Record<Category, string> = {
    Food: 'food',
    Transport: 'car',
    Shopping: 'shopping',
    Bills: 'receipt',
    Entertainment: 'movie',
    Healthcare: 'hospital',
    Others: 'dots-horizontal',
  };
  return iconMap[category];
};

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const isDebit = transaction.type === 'debit';
  const amountColor = isDebit ? colors.debit : colors.credit;

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                {backgroundColor: `${amountColor}20`},
              ]}>
              <Icon
                name={getCategoryIcon(transaction.category)}
                size={24}
                color={amountColor}
              />
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.row}>
              <Text style={styles.description} numberOfLines={1}>
                {transaction.description}
              </Text>
              <Text style={[styles.amount, {color: amountColor}]}>
                {isDebit ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.metaContainer}>
                <Text style={styles.category}>{transaction.category}</Text>
                {transaction.bankName && (
                  <>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.bank}>{transaction.bankName}</Text>
                  </>
                )}
              </View>
              <Text style={styles.date}>{formatDate(transaction.date)}</Text>
            </View>

            {transaction.source === 'sms' && (
              <Chip
                icon="message-text"
                style={styles.sourceChip}
                textStyle={styles.sourceChipText}
                compact>
                SMS
              </Chip>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: colors.surface,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  description: {
    ...typography.bodyLarge,
    fontWeight: '500',
    color: colors.onSurface,
    flex: 1,
    marginRight: 8,
  },
  amount: {
    ...typography.titleMedium,
    fontWeight: '600',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  category: {
    ...typography.bodySmall,
    color: colors.onSurface,
    opacity: 0.6,
  },
  separator: {
    ...typography.bodySmall,
    color: colors.onSurface,
    opacity: 0.6,
    marginHorizontal: 4,
  },
  bank: {
    ...typography.bodySmall,
    color: colors.onSurface,
    opacity: 0.6,
  },
  date: {
    ...typography.bodySmall,
    color: colors.onSurface,
    opacity: 0.6,
  },
  sourceChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    height: 24,
    backgroundColor: colors.secondary + '20',
  },
  sourceChipText: {
    ...typography.labelSmall,
    marginVertical: 0,
  },
});
