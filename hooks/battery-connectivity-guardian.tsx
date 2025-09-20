import { useEffect, useCallback, useState, useRef } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Battery from 'expo-battery';

interface BatteryStatus {
  level: number;
  isCharging: boolean;
  lowBatteryMode?: boolean;
}

interface ConnectivityStatus {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
}

type GuardianAlertType = 'low_battery' | 'battery_critical' | 'connectivity_lost' | 'connectivity_restored';

export function useBatteryConnectivityGuardian({
  deviceInfo,
  addWellnessAlert,
}: {
  deviceInfo?: { familyMembers?: string[] } | null;
  addWellnessAlert?: (alert: any) => Promise<any>;
} = {}) {
  const deviceInfoRef = useRef(deviceInfo);
  const addWellnessAlertRef = useRef(addWellnessAlert);
  
  // Update refs when props change
  useEffect(() => {
    deviceInfoRef.current = deviceInfo;
    addWellnessAlertRef.current = addWellnessAlert;
  }, [deviceInfo, addWellnessAlert]);
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>({
    level: 1,
    isCharging: false,
  });
  const [connectivityStatus, setConnectivityStatus] = useState<ConnectivityStatus>({
    isConnected: true,
    type: null,
    isInternetReachable: null,
  });
  const [lastAlerts, setLastAlerts] = useState<{ [key: string]: number }>({});

  // Battery monitoring
  const updateBatteryStatus = useCallback(async () => {
    if (Platform.OS === 'web') {
      // Web battery API (limited support)
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryStatus({
            level: battery.level,
            isCharging: battery.charging,
          });
        } catch (error) {
          console.log('Battery API not supported on this browser');
        }
      }
      return;
    }

    try {
      const [level, state, lowPowerMode] = await Promise.all([
        Battery.getBatteryLevelAsync(),
        Battery.getBatteryStateAsync(),
        Battery.isLowPowerModeEnabledAsync().catch(() => false),
      ]);

      setBatteryStatus({
        level,
        isCharging: state === Battery.BatteryState.CHARGING,
        lowBatteryMode: lowPowerMode,
      });
    } catch (error) {
      console.error('Error getting battery status:', error);
    }
  }, []);

  // Connectivity monitoring
  const updateConnectivityStatus = useCallback(async () => {
    try {
      const netInfo = await NetInfo.fetch();
      setConnectivityStatus({
        isConnected: netInfo.isConnected ?? false,
        type: netInfo.type,
        isInternetReachable: netInfo.isInternetReachable,
      });
    } catch (error) {
      console.error('Error getting connectivity status:', error);
    }
  }, []);

  // Send alert to family portal
  const sendGuardianAlert = useCallback(async (alert: { type: GuardianAlertType; message: string }) => {
    const currentDeviceInfo = deviceInfoRef.current;
    const currentAddWellnessAlert = addWellnessAlertRef.current;
    
    if (!currentDeviceInfo?.familyMembers?.length || !currentAddWellnessAlert) {
      console.log('No family members to alert or no alert function available');
      return;
    }

    // Prevent spam - don't send same alert type within 30 minutes
    const now = Date.now();
    const lastAlertTime = lastAlerts[alert.type] || 0;
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (now - lastAlertTime < thirtyMinutes) {
      console.log(`Skipping ${alert.type} alert - too recent`);
      return;
    }

    try {
      // Send the alert
      await currentAddWellnessAlert({
        type: alert.type,
        message: alert.message,
        acknowledged: false,
        familyMemberIds: currentDeviceInfo.familyMembers,
      });
      
      console.log(`Guardian alert sent: ${alert.type}`);
      
      // Update last alert time
      setLastAlerts(prev => ({
        ...prev,
        [alert.type]: now,
      }));
    } catch (error) {
      console.error('Error sending guardian alert:', error);
    }
  }, []);

  // Check battery levels and send alerts
  const checkBatteryAlerts = useCallback(async () => {
    const { level, isCharging } = batteryStatus;
    
    // Critical battery (5% or below)
    if (level <= 0.05 && !isCharging) {
      await sendGuardianAlert({
        type: 'battery_critical',
        message: `URGENT: Phone battery critically low (${Math.round(level * 100)}%). Device may shut down soon. Please charge immediately.`,
      });
    }
    // Low battery (20% or below)
    else if (level <= 0.20 && !isCharging) {
      await sendGuardianAlert({
        type: 'low_battery',
        message: `Phone battery low (${Math.round(level * 100)}%). Please remind to charge the device.`,
      });
    }
  }, [batteryStatus.level, batteryStatus.isCharging, sendGuardianAlert]);

  // Check connectivity and send alerts
  const checkConnectivityAlerts = useCallback(async () => {
    const { isConnected, isInternetReachable } = connectivityStatus;
    
    if (!isConnected || isInternetReachable === false) {
      await sendGuardianAlert({
        type: 'connectivity_lost',
        message: 'Phone has lost internet connection. Unable to receive calls or messages. Please check Wi-Fi or mobile data.',
      });
    }
  }, [connectivityStatus.isConnected, connectivityStatus.isInternetReachable, sendGuardianAlert]);

  // Set up battery monitoring
  useEffect(() => {
    updateBatteryStatus();
    
    if (Platform.OS !== 'web') {
      // Set up battery level listener
      const batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel }: { batteryLevel: number }) => {
        setBatteryStatus(prev => ({ ...prev, level: batteryLevel }));
      });

      // Set up battery state listener
      const stateSubscription = Battery.addBatteryStateListener(({ batteryState }: { batteryState: Battery.BatteryState }) => {
        setBatteryStatus(prev => ({ 
          ...prev, 
          isCharging: batteryState === Battery.BatteryState.CHARGING 
        }));
      });

      return () => {
        batterySubscription?.remove();
        stateSubscription?.remove();
      };
    }
  }, [updateBatteryStatus]);

  // Set up connectivity monitoring
  useEffect(() => {
    updateConnectivityStatus();
    
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const isNowConnected = state.isConnected ?? false;
      
      setConnectivityStatus(prevStatus => {
        const wasConnected = prevStatus.isConnected;
        
        // Send restoration alert if connection was lost and now restored
        if (!wasConnected && isNowConnected && addWellnessAlertRef.current) {
          // Use setTimeout to avoid calling sendGuardianAlert during render
          setTimeout(() => {
            sendGuardianAlert({
              type: 'connectivity_restored',
              message: 'Phone internet connection restored. Device is back online.',
            });
          }, 0);
        }
        
        return {
          isConnected: isNowConnected,
          type: state.type,
          isInternetReachable: state.isInternetReachable,
        };
      });
    });

    return unsubscribe;
  }, [updateConnectivityStatus, sendGuardianAlert]);

  // Periodic checks
  useEffect(() => {
    const interval = setInterval(() => {
      checkBatteryAlerts();
      checkConnectivityAlerts();
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Initial check
    checkBatteryAlerts();
    checkConnectivityAlerts();

    return () => clearInterval(interval);
  }, [checkBatteryAlerts, checkConnectivityAlerts]);

  return {
    batteryStatus,
    connectivityStatus,
    isGuardianActive: !!deviceInfoRef.current?.familyMembers?.length,
    sendGuardianAlert,
  };
}