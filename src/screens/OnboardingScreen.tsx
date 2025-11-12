import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { setOnboardingComplete } from '../store/settingsSlice';
import { theme } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Automatic Expense Tracking',
    description:
      'Automatically track your expenses by reading bank SMS messages. No manual entry needed!',
    icon: 'message-text-outline',
  },
  {
    id: '2',
    title: 'Smart Categorization',
    description:
      'Your expenses are automatically categorized for better insights into your spending habits.',
    icon: 'shape-outline',
  },
  {
    id: '3',
    title: 'Visual Insights',
    description:
      'Get beautiful charts and reports to understand where your money goes each month.',
    icon: 'chart-pie',
  },
  {
    id: '4',
    title: 'Complete Privacy',
    description:
      'All your data stays on your device. No cloud sync, no data sharing, complete privacy.',
    icon: 'shield-lock-outline',
  },
];

export const OnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_complete', 'true');
      dispatch(setOnboardingComplete(true));
      navigation.replace('Permissions');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      navigation.replace('Permissions');
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <Icon name={item.icon} size={120} color={theme.colors.primary} />
      <Text variant="headlineMedium" style={styles.title}>
        {item.title}
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        {item.description}
      </Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      {renderPagination()}
      <View style={styles.buttonContainer}>
        {currentIndex < slides.length - 1 && (
          <Button
            mode="text"
            onPress={handleSkip}
            style={styles.skipButton}
            labelStyle={styles.skipButtonLabel}
          >
            Skip
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.nextButton}
        >
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    marginTop: 32,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  description: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.disabled,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  skipButton: {
    flex: 1,
  },
  skipButtonLabel: {
    color: theme.colors.primary,
  },
  nextButton: {
    flex: 1,
    marginLeft: 10,
  },
});
