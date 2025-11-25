/**
 * Smart Expense Tracker App
 * @format
 */

import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import React, {useEffect, useState, useRef} from 'react';
import {StatusBar, StyleSheet, View, ActivityIndicator, AppState, AppStateStatus, Text} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider as ReduxProvider} from 'react-redux';
import {store} from './src/store';
import {initDatabase} from './src/db/database';
import {AppNavigator} from './src/navigation/AppNavigator';
import {theme} from './src/theme/theme';
import {initializeSMSAutoTracking} from './src/services/smsAutoTracker';
import {loadTransactions} from './src/store/transactionSlice';

function AppContent() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const smsCleanupRef = useRef<(() => void) | null>(null);
  const appState = useRef(AppState.currentState);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React strict mode
    if (isInitializedRef.current) {
      return;
    }
    isInitializedRef.current = true;

    const setupApp = async () => {
      try {
        // Initialize database
        await initDatabase();
        setIsDbReady(true);
        setInitError(null);

        // Initialize SMS auto-tracking
        console.log('Initializing SMS auto-tracking...');
        const cleanup = await initializeSMSAutoTracking((transaction) => {
          console.log('✅ New transaction created from SMS:', transaction.id);
          console.log('Transaction details:', transaction);
          // Reload transactions to update UI
          store.dispatch(loadTransactions());
        });

        if (cleanup) {
          console.log('✅ SMS auto-tracking initialized successfully');
        } else {
          console.log('⚠️ SMS auto-tracking not initialized (permission may not be granted)');
        }
        
        smsCleanupRef.current = cleanup;
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError('Failed to initialize database. Some features may not work properly.');
        // Set ready anyway to allow app to function
        setIsDbReady(true);
      }
    };

    setupApp();

    // Cleanup SMS listener on unmount
    return () => {
      if (smsCleanupRef.current) {
        console.log('Cleaning up SMS listener on unmount');
        smsCleanupRef.current();
        smsCleanupRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground');
        // Reload transactions to show any new ones
        store.dispatch(loadTransactions());
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.primary}
        />
        <AppNavigator />
        {initError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{initError}</Text>
          </View>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <AppContent />
      </PaperProvider>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.error,
    padding: 12,
    zIndex: 1000,
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default App;
