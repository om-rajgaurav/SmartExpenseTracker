import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {PieChart} from 'react-native-svg-charts';
import {Category} from '../types';
import {colors, typography} from '../theme/theme';
import {formatCurrency} from '../utils/helpers';

const {width} = Dimensions.get('window');

interface CategoryChartProps {
  categoryTotals: Record<Category, number>;
}

const CHART_COLORS: Record<Category, string> = {
  Food: '#FF6384',
  Transport: '#36A2EB',
  Shopping: '#FFCE56',
  Bills: '#4BC0C0',
  Entertainment: '#9966FF',
  Healthcare: '#FF9F40',
  Others: '#C9CBCF',
};

export const CategoryChart: React.FC<CategoryChartProps> = ({
  categoryTotals,
}) => {
  // Transform data for display
  const chartData = Object.entries(categoryTotals)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => ({
      category: category as Category,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Text style={styles.title}>Category Breakdown</Text>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expense data available</Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  // Prepare data for pie chart
  const pieData = chartData.map((item, index) => ({
    value: item.value,
    svg: {fill: CHART_COLORS[item.category]},
    key: `pie-${index}`,
  }));

  return (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <Text style={styles.title}>Category Breakdown</Text>
        
        <View style={styles.chartContainer}>
          {/* Pie Chart */}
          <PieChart
            style={{height: 200, width: width - 64}}
            data={pieData}
            innerRadius="40%"
            outerRadius="80%"
            padAngle={0.02}
          />
          
          {/* Legend */}
          <View style={styles.legendContainer}>
            {chartData.map(item => {
              const percentage = (item.value / totalExpenses) * 100;
              return (
                <View key={item.category} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {backgroundColor: CHART_COLORS[item.category]},
                    ]}
                  />
                  <View style={styles.legendTextContainer}>
                    <Text style={styles.legendLabel}>{item.category}</Text>
                    <Text style={styles.legendValue}>
                      {formatCurrency(item.value)} ({percentage.toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              );
            })}
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
  title: {
    ...typography.titleLarge,
    color: colors.onSurface,
    marginBottom: 8,
  },
  chartContainer: {
    alignItems: 'center',
  },
  legendContainer: {
    marginTop: 16,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    fontWeight: '600',
    marginBottom: 2,
  },
  legendValue: {
    ...typography.bodySmall,
    color: colors.onSurface,
    opacity: 0.7,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyLarge,
    color: colors.onSurface,
    opacity: 0.6,
  },
});
