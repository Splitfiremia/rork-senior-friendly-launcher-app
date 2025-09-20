import { useEffect, useCallback, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';

export function useWellnessMonitoring({
  settings,
  recordActivity,
  addWellnessCheckIn,
  addWellnessAlert,
  getTodaysCheckIn,
  getHoursSinceLastActivity,
  deviceInfo,
}: {
  settings?: { wellnessChecks: any };
  recordActivity?: () => void;
  addWellnessCheckIn?: (checkIn: any) => Promise<any>;
  addWellnessAlert?: (alert: any) => Promise<any>;
  getTodaysCheckIn?: () => any;
  getHoursSinceLastActivity?: () => number;
  deviceInfo?: { familyMembers?: string[] } | null;
} = {}) {
  // Use refs to avoid circular dependencies
  const settingsRef = useRef(settings);
  const recordActivityRef = useRef(recordActivity);
  const addWellnessCheckInRef = useRef(addWellnessCheckIn);
  const addWellnessAlertRef = useRef(addWellnessAlert);
  const getTodaysCheckInRef = useRef(getTodaysCheckIn);
  const getHoursSinceLastActivityRef = useRef(getHoursSinceLastActivity);
  const deviceInfoRef = useRef(deviceInfo);
  
  // Update refs when props change
  useEffect(() => {
    settingsRef.current = settings;
    recordActivityRef.current = recordActivity;
    addWellnessCheckInRef.current = addWellnessCheckIn;
    addWellnessAlertRef.current = addWellnessAlert;
    getTodaysCheckInRef.current = getTodaysCheckIn;
    getHoursSinceLastActivityRef.current = getHoursSinceLastActivity;
    deviceInfoRef.current = deviceInfo;
  }, [settings, recordActivity, addWellnessCheckIn, addWellnessAlert, getTodaysCheckIn, getHoursSinceLastActivity, deviceInfo]);

  // Record activity when app becomes active
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && recordActivityRef.current) {
      recordActivityRef.current();
    }
  }, []);

  // Helper function to check for existing alerts of a specific type today
  const checkForExistingAlert = useCallback(async (alertType: string) => {
    // In a real implementation, this would check the alerts array
    // For now, we'll assume no existing alerts to avoid spam
    return false;
  }, []);

  // Check for missed check-ins and inactivity
  const performWellnessCheck = useCallback(async () => {
    const currentSettings = settingsRef.current;
    const currentGetTodaysCheckIn = getTodaysCheckInRef.current;
    const currentGetHoursSinceLastActivity = getHoursSinceLastActivityRef.current;
    const currentAddWellnessAlert = addWellnessAlertRef.current;
    const currentDeviceInfo = deviceInfoRef.current;
    
    if (!currentSettings?.wellnessChecks?.enabled || !currentGetTodaysCheckIn || !currentGetHoursSinceLastActivity || !currentAddWellnessAlert) return;

    try {
      const now = new Date();
      const todaysCheckIn = currentGetTodaysCheckIn();
      const hoursSinceActivity = currentGetHoursSinceLastActivity();

      // Check if it's past the check-in time and no check-in today
      const [checkInHour, checkInMinute] = currentSettings.wellnessChecks.checkInTime.split(':').map(Number);
      const checkInTime = new Date();
      checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

      // Check if it's past reminder time and no check-in today
      const [reminderHour, reminderMinute] = currentSettings.wellnessChecks.reminderTime.split(':').map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(reminderHour, reminderMinute, 0, 0);

      // If it's past check-in time and no check-in today, create alert
      if (now > checkInTime && !todaysCheckIn) {
        const existingMissedAlert = await checkForExistingAlert('missed_checkin');
        if (!existingMissedAlert) {
          await currentAddWellnessAlert({
            type: 'missed_checkin',
            message: `No check-in received today. Last expected at ${currentSettings.wellnessChecks.checkInTime}.`,
            acknowledged: false,
            familyMemberIds: currentDeviceInfo?.familyMembers || [],
          });
        }
      }

      // If it's past reminder time and no check-in today, send reminder notification
      if (now > reminderTime && !todaysCheckIn) {
        // In a real app, this would trigger a local notification
        console.log('Wellness check reminder: Time to check in!');
      }

      // Check for prolonged inactivity
      if (hoursSinceActivity >= currentSettings.wellnessChecks.autoCheckThreshold) {
        const existingInactivityAlert = await checkForExistingAlert('no_activity');
        if (!existingInactivityAlert) {
          await currentAddWellnessAlert({
            type: 'no_activity',
            message: `No phone activity detected for ${hoursSinceActivity} hours. Last activity: ${new Date(Date.now() - hoursSinceActivity * 60 * 60 * 1000).toLocaleString()}.`,
            acknowledged: false,
            familyMemberIds: currentDeviceInfo?.familyMembers || [],
          });
        }
      }
    } catch (error) {
      console.error('Error in wellness check:', error);
    }
  }, [checkForExistingAlert]);

  // Auto check-in if activity is detected and no manual check-in today
  const performAutoCheckIn = useCallback(async () => {
    const currentSettings = settingsRef.current;
    const currentGetTodaysCheckIn = getTodaysCheckInRef.current;
    const currentGetHoursSinceLastActivity = getHoursSinceLastActivityRef.current;
    const currentAddWellnessCheckIn = addWellnessCheckInRef.current;
    
    if (!currentSettings?.wellnessChecks?.enabled || !currentGetTodaysCheckIn || !currentGetHoursSinceLastActivity || !currentAddWellnessCheckIn) return;

    const todaysCheckIn = currentGetTodaysCheckIn();
    const hoursSinceActivity = currentGetHoursSinceLastActivity();

    // If there's recent activity (within 1 hour) and no check-in today, auto check-in
    if (hoursSinceActivity < 1 && !todaysCheckIn) {
      const now = new Date();
      const [checkInHour, checkInMinute] = currentSettings.wellnessChecks.checkInTime.split(':').map(Number);
      const checkInTime = new Date();
      checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

      // Only auto check-in if it's past the expected check-in time
      if (now > checkInTime) {
        await currentAddWellnessCheckIn({
          type: 'auto',
          status: 'ok',
          message: 'Automatic check-in based on phone activity',
        });
      }
    }
  }, []);

  // Set up monitoring
  useEffect(() => {
    // Record initial activity
    if (recordActivityRef.current) {
      recordActivityRef.current();
    }

    // Set up app state listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Set up periodic wellness checks (every 30 minutes)
    const wellnessInterval = setInterval(performWellnessCheck, 30 * 60 * 1000);

    // Set up auto check-in checks (every 15 minutes)
    const autoCheckInterval = setInterval(performAutoCheckIn, 15 * 60 * 1000);

    // Perform initial checks
    performWellnessCheck();
    performAutoCheckIn();

    return () => {
      subscription?.remove();
      clearInterval(wellnessInterval);
      clearInterval(autoCheckInterval);
    };
  }, [handleAppStateChange, performWellnessCheck, performAutoCheckIn]);

  // Set up background task for iOS/Android (would need expo-background-fetch in production)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // In a production app, you would set up background tasks here
      // to continue monitoring even when the app is backgrounded
      console.log('Wellness monitoring active');
    }
  }, []);

  return {
    performWellnessCheck,
    performAutoCheckIn,
    isGuardianActive: !!deviceInfoRef.current?.familyMembers?.length,
  };
}