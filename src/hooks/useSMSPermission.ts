import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { setSMSPermission } from '../store/settingsSlice';

export const useSMSPermission = () => {
  const dispatch = useDispatch<AppDispatch>();
  const hasSMSPermission = useSelector(
    (state: RootState) => state.settings.hasSMSPermission
  );
  const [isChecking, setIsChecking] = useState(false);

  const checkPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );
      dispatch(setSMSPermission(granted));
      return granted;
    } catch (error) {
      console.error('Error checking SMS permission:', error);
      return false;
    }
  }, [dispatch]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Not Available',
        'SMS reading is only available on Android devices.'
      );
      return false;
    }

    setIsChecking(true);
    try {
      // Request both READ_SMS and RECEIVE_SMS permissions
      const readGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission Required',
          message:
            'Smart Expense Tracker needs access to your SMS messages to automatically track expenses from bank notifications.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      let receiveGranted = PermissionsAndroid.RESULTS.GRANTED;
      
      // Only request RECEIVE_SMS if READ_SMS was granted
      if (readGranted === PermissionsAndroid.RESULTS.GRANTED) {
        receiveGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          {
            title: 'Receive SMS Permission',
            message:
              'Allow Smart Expense Tracker to receive new SMS messages for real-time expense tracking.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
      }

      const isGranted = 
        readGranted === PermissionsAndroid.RESULTS.GRANTED &&
        receiveGranted === PermissionsAndroid.RESULTS.GRANTED;
        
      dispatch(setSMSPermission(isGranted));
      setIsChecking(false);
      return isGranted;
    } catch (error) {
      console.error('Error requesting SMS permission:', error);
      setIsChecking(false);
      return false;
    }
  }, [dispatch]);

  const openSettings = useCallback(() => {
    Alert.alert(
      'Permission Required',
      'Please enable SMS permission in your device settings to automatically track expenses from bank messages.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    hasSMSPermission,
    isChecking,
    requestPermission,
    checkPermission,
    openSettings,
  };
};
