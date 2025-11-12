import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSMSPermission } from '../hooks/useSMSPermission';
import { theme } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { initializeSMSAutoTracking } from '../services/smsAutoTracker';
import { useDispatch } from 'react-redux';
import { loadTransactions } from '../store/transactionSlice';
import { AppDispatch } from '../store';

export const PermissionsScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { hasSMSPermission, isChecking, requestPermission, openSettings } = useSMSPermission();
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    
    if (granted) {
      await AsyncStorage.setItem('@sms_permission', 'true');
      
      // Initialize SMS auto-tracking after permission is granted
      setIsProcessing(true);
      try {
        await initializeSMSAutoTracking((transaction) => {
          console.log('New transaction created from SMS:', transaction.id);
          dispatch(loadTransactions());
        });
      } catch (error) {
        console.error('Error initializing SMS auto-tracking:', error);
      }
      setIsProcessing(false);
      
      navigation.replace('MainApp');
    } else {
      setPermissionDenied(true);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('@sms_permission', 'false');
    navigation.replace('MainApp');
  };

  const handleOpenSettings = () => {
    openSettings();
  };

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.container}>
        <Icon name="cellphone-off" size={100} color={theme.colors.disabled} />
        <Text variant="headlineMedium" style={styles.title}>
          SMS Reading Not Available
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          Automatic expense tracking via SMS is only available on Android devices.
          You can still use the app to manually track your expenses.
        </Text>
        <Button
          mode="contained"
          onPress={handleSkip}
          style={styles.button}
        >
          Continue
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Icon
        name="message-text-lock-outline"
        size={100}
        color={theme.colors.primary}
      />
      <Text variant="headlineMedium" style={styles.title}>
        SMS Permission Required
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        To automatically track your expenses, we need permission to read your SMS messages.
        We only read bank transaction messages and never share your data.
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.featureRow}>
            <Icon name="shield-check" size={24} color={theme.colors.success} />
            <Text variant="bodyMedium" style={styles.featureText}>
              Your data stays on your device
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Icon name="bank" size={24} color={theme.colors.success} />
            <Text variant="bodyMedium" style={styles.featureText}>
              Only bank messages are read
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Icon name="lock" size={24} color={theme.colors.success} />
            <Text variant="bodyMedium" style={styles.featureText}>
              No data is shared with anyone
            </Text>
          </View>
        </Card.Content>
      </Card>

      {permissionDenied && (
        <Card style={[styles.card, styles.warningCard]}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.warningText}>
              Permission was denied. You can still use the app to manually track expenses,
              or enable SMS permission later from settings.
            </Text>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="contained"
        onPress={handleRequestPermission}
        style={styles.button}
        loading={isChecking || isProcessing}
        disabled={isChecking || isProcessing}
      >
        {isProcessing ? 'Processing SMS...' : 'Grant Permission'}
      </Button>

      {permissionDenied && (
        <Button
          mode="outlined"
          onPress={handleOpenSettings}
          style={styles.button}
        >
          Open Settings
        </Button>
      )}

      <Button
        mode="text"
        onPress={handleSkip}
        style={styles.skipButton}
      >
        Skip for Now
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  description: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    marginBottom: 16,
  },
  warningCard: {
    backgroundColor: theme.colors.warning + '20',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  featureText: {
    marginLeft: 12,
    flex: 1,
  },
  warningText: {
    color: theme.colors.onSurface,
  },
  button: {
    width: '100%',
    marginVertical: 8,
  },
  skipButton: {
    marginTop: 8,
  },
});
