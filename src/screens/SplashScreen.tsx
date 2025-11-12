import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { setOnboardingComplete, setSMSPermission } from '../store/settingsSlice';
import { theme } from '../theme/theme';

export const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for minimum 2 seconds
        await new Promise<void>(resolve => setTimeout(resolve, 2000));

        // Check onboarding status
        const onboardingComplete = await AsyncStorage.getItem('@onboarding_complete');
        const smsPermission = await AsyncStorage.getItem('@sms_permission');

        // Update Redux state
        dispatch(setOnboardingComplete(onboardingComplete === 'true'));
        dispatch(setSMSPermission(smsPermission === 'true'));

        // Navigate based on onboarding status
        if (onboardingComplete === 'true') {
          navigation.replace('MainApp');
        } else {
          navigation.replace('Onboarding');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // Default to onboarding on error
        navigation.replace('Onboarding');
      }
    };

    initializeApp();
  }, [navigation, dispatch]);

  return (
    <View style={styles.container}>
      <Text variant="displayMedium" style={styles.title}>
        Smart Expense Tracker
      </Text>
      <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  title: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 20,
  },
});
