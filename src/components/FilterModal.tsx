import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Modal, Portal, Text, Button, Chip, Divider} from 'react-native-paper';
import {Category, TransactionFilters} from '../types';
import {colors, typography} from '../theme/theme';
import {format} from 'date-fns';

interface FilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  onApply: (filters: TransactionFilters) => void;
  currentFilters: TransactionFilters;
  availableBanks: string[];
}

const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Others',
];

const getMonthOptions = (): {label: string; value: string}[] => {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: format(date, 'MMMM yyyy'),
      value: format(date, 'yyyy-MM'),
    });
  }
  
  return months;
};

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onDismiss,
  onApply,
  currentFilters,
  availableBanks,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
    currentFilters.month,
  );
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(currentFilters.category);
  const [selectedBank, setSelectedBank] = useState<string | undefined>(
    currentFilters.bank,
  );

  const monthOptions = getMonthOptions();

  useEffect(() => {
    setSelectedMonth(currentFilters.month);
    setSelectedCategory(currentFilters.category);
    setSelectedBank(currentFilters.bank);
  }, [currentFilters]);

  const handleApply = () => {
    const filters: TransactionFilters = {};
    
    if (selectedMonth) {
      filters.month = selectedMonth;
    }
    if (selectedCategory) {
      filters.category = selectedCategory;
    }
    if (selectedBank) {
      filters.bank = selectedBank;
    }
    
    onApply(filters);
    onDismiss();
  };

  const handleClear = () => {
    setSelectedMonth(undefined);
    setSelectedCategory(undefined);
    setSelectedBank(undefined);
  };

  const hasActiveFilters =
    selectedMonth || selectedCategory || selectedBank;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Filter Transactions</Text>

          {/* Month Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Month</Text>
            <View style={styles.chipContainer}>
              {monthOptions.map(month => (
                <Chip
                  key={month.value}
                  selected={selectedMonth === month.value}
                  onPress={() =>
                    setSelectedMonth(
                      selectedMonth === month.value ? undefined : month.value,
                    )
                  }
                  style={styles.chip}
                  textStyle={styles.chipText}>
                  {month.label}
                </Chip>
              ))}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Category Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.chipContainer}>
              {CATEGORIES.map(category => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === category ? undefined : category,
                    )
                  }
                  style={styles.chip}
                  textStyle={styles.chipText}>
                  {category}
                </Chip>
              ))}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Bank Filter */}
          {availableBanks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bank</Text>
              <View style={styles.chipContainer}>
                {availableBanks.map(bank => (
                  <Chip
                    key={bank}
                    selected={selectedBank === bank}
                    onPress={() =>
                      setSelectedBank(
                        selectedBank === bank ? undefined : bank,
                      )
                    }
                    style={styles.chip}
                    textStyle={styles.chipText}>
                    {bank}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleClear}
              disabled={!hasActiveFilters}
              style={styles.button}>
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={handleApply}
              style={styles.button}>
              Apply Filters
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    ...typography.headlineSmall,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.titleMedium,
    fontWeight: '500',
    color: colors.onSurface,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    ...typography.bodyMedium,
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
