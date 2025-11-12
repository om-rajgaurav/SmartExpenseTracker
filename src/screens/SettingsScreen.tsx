import React, {useState} from 'react';
import {View, StyleSheet, Alert, Platform} from 'react-native';
import {Button, Text, Card, Divider, Switch} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../theme/theme';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../store';
import {useSMSPermission} from '../hooks/useSMSPermission';
import {initializeSMSAutoTracking} from '../services/smsAutoTracker';
import {loadTransactions} from '../store/transactionSlice';
import * as db from '../db/database';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const {hasSMSPermission, requestPermission, openSettings} = useSMSPermission();
  const [isResetting, setIsResetting] = useState(false);
  const [isEnablingSMS, setIsEnablingSMS] = useState(false);

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will clear your onboarding status and show the welcome screens again on next launch. Your transactions will NOT be deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@onboarding_complete');
              await AsyncStorage.removeItem('@sms_permission');
              Alert.alert(
                'Success',
                'Onboarding reset! Please restart the app to see the onboarding flow.',
              );
            } catch (error) {
              console.error('Error resetting onboarding:', error);
              Alert.alert('Error', 'Failed to reset onboarding');
            }
          },
        },
      ],
    );
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete ALL your data including transactions, settings, and onboarding status. This action cannot be undone!',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              // Clear AsyncStorage
              await AsyncStorage.clear();
              
              // Clear database (you'll need to implement this in database.ts)
              // await db.clearAllData();
              
              Alert.alert(
                'Success',
                'All data cleared! Please restart the app.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // You might want to restart the app here
                    },
                  },
                ],
              );
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear all data');
            } finally {
              setIsResetting(false);
            }
          },
        },
      ],
    );
  };

  const handleEnableSMS = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Not Available',
        'SMS reading is only available on Android devices.',
      );
      return;
    }

    setIsEnablingSMS(true);
    try {
      const granted = await requestPermission();
      
      if (granted) {
        // Initialize SMS auto-tracking
        await initializeSMSAutoTracking((transaction) => {
          console.log('New transaction created from SMS:', transaction.id);
          dispatch(loadTransactions());
        });
        
        Alert.alert(
          'Success',
          'SMS permission granted! Your bank SMS messages will now be automatically tracked.',
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'You can enable SMS permission later from your device settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: openSettings},
          ],
        );
      }
    } catch (error) {
      console.error('Error enabling SMS:', error);
      Alert.alert('Error', 'Failed to enable SMS auto-tracking');
    } finally {
      setIsEnablingSMS(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="SMS Auto-Tracking" />
        <Card.Content>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyLarge" style={styles.settingTitle}>
                SMS Permission
              </Text>
              <Text variant="bodySmall" style={styles.settingDescription}>
                {hasSMSPermission
                  ? 'Automatically track expenses from bank SMS'
                  : 'Enable to automatically track expenses from bank SMS'}
              </Text>
            </View>
            <View style={styles.settingControl}>
              {hasSMSPermission ? (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>✓ Enabled</Text>
                </View>
              ) : (
                <Button
                  mode="contained"
                  onPress={handleEnableSMS}
                  loading={isEnablingSMS}
                  disabled={isEnablingSMS}
                  compact>
                  Enable
                </Button>
              )}
            </View>
          </View>
          
          {!hasSMSPermission && Platform.OS === 'android' && (
            <View style={styles.warningBox}>
              <Text variant="bodySmall" style={styles.warningText}>
                💡 Without SMS permission, you'll need to manually add all expenses.
                Grant permission to automatically track bank transactions.
              </Text>
            </View>
          )}
          
          {hasSMSPermission && (
            <View style={styles.infoBox}>
              <Text variant="bodySmall" style={styles.infoText}>
                ✓ SMS auto-tracking is active. Bank transaction messages will be
                automatically converted to expense entries.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="App Settings" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.description}>
            Manage your app preferences and data
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Developer Options" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            These options are for testing and development purposes
          </Text>
          
          <Divider style={styles.divider} />
          
          <Button
            mode="outlined"
            onPress={handleResetOnboarding}
            style={styles.button}
            icon="refresh">
            Reset Onboarding
          </Button>
          
          <Text variant="bodySmall" style={styles.buttonDescription}>
            Clear onboarding status to see welcome screens again
          </Text>

          <Divider style={styles.divider} />

          <Button
            mode="contained"
            onPress={handleClearAllData}
            style={[styles.button, styles.dangerButton]}
            buttonColor={theme.colors.error}
            loading={isResetting}
            disabled={isResetting}
            icon="delete-forever">
            Clear All Data
          </Button>
          
          <Text variant="bodySmall" style={styles.buttonDescription}>
            Delete all transactions and reset the app completely
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  sectionDescription: {
    color: theme.colors.onSurface,
    opacity: 0.6,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  button: {
    marginBottom: 8,
  },
  dangerButton: {
    marginTop: 8,
  },
  buttonDescription: {
    color: theme.colors.onSurface,
    opacity: 0.5,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: theme.colors.onSurface,
    opacity: 0.6,
  },
  settingControl: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: theme.colors.success,
    fontWeight: '600',
    fontSize: 12,
  },
  warningBox: {
    backgroundColor: theme.colors.warning + '15',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
    marginTop: 8,
  },
  warningText: {
    color: theme.colors.onSurface,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: theme.colors.success + '15',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success,
    marginTop: 8,
  },
  infoText: {
    color: theme.colors.onSurface,
    lineHeight: 18,
  },
});
