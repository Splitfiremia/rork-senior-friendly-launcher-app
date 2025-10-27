import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Device, FamilyMember, DashboardSession, RemoteCommand, Reminder, ReminderAlert } from '@/types/dashboard';


// Pure JavaScript UUID generator (works on all platforms)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const STORAGE_KEYS = {
  DEVICE_ID: 'device_id',
  DEVICE_INFO: 'device_info',
  DASHBOARD_SESSION: 'dashboard_session',
  PENDING_COMMANDS: 'pending_commands',
  REMINDERS: 'reminders',
  REMINDER_ALERTS: 'reminder_alerts',
};

export const [DashboardProvider, useDashboard] = createContextHook(() => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<Device | null>(null);
  const [session, setSession] = useState<DashboardSession | null>(null);
  const [pendingCommands, setPendingCommands] = useState<RemoteCommand[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderAlerts, setReminderAlerts] = useState<ReminderAlert[]>([]);
  const queryClient = useQueryClient();
  
  // Use refs to store mutation functions to prevent dependency changes
  const pairDeviceRef = React.useRef<any>(null);
  const authenticateFamilyMemberRef = React.useRef<any>(null);

  // Initialize device ID
  useEffect(() => {
    initializeDevice();
  }, []);

  const initializeDevice = async () => {
    try {
      let storedDeviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      
      if (!storedDeviceId) {
        // Generate a unique device ID
        storedDeviceId = generateUUID();
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, storedDeviceId);
      }
      
      setDeviceId(storedDeviceId);
      
      // Load stored device info, session, reminders, and alerts
      const [storedDeviceInfo, storedSession, storedReminders, storedAlerts] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DEVICE_INFO),
        AsyncStorage.getItem(STORAGE_KEYS.DASHBOARD_SESSION),
        AsyncStorage.getItem(STORAGE_KEYS.REMINDERS),
        AsyncStorage.getItem(STORAGE_KEYS.REMINDER_ALERTS),
      ]);
      
      if (storedDeviceInfo) {
        setDeviceInfo(JSON.parse(storedDeviceInfo));
      }
      
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        // Check if session is still valid
        if (new Date(parsedSession.expiresAt) > new Date()) {
          setSession(parsedSession);
        } else {
          await AsyncStorage.removeItem(STORAGE_KEYS.DASHBOARD_SESSION);
        }
      }
      
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
      
      if (storedAlerts) {
        setReminderAlerts(JSON.parse(storedAlerts));
      }
    } catch (error) {
      console.error('Error initializing device:', error);
    }
  };

  // Generate pairing code for QR display
  const generatePairingCode = useCallback(() => {
    if (!deviceId) return null;
    
    const pairingData = {
      deviceId,
      timestamp: new Date().toISOString(),
      type: 'senior_launcher_pairing',
    };
    
    return JSON.stringify(pairingData);
  }, [deviceId]);

  // Pair device with family dashboard
  const pairDevice = useMutation({
    mutationFn: async (pairingToken: string) => {
      // In a real app, this would call your backend API
      // For now, we'll simulate the pairing process
      const newDevice: Device = {
        id: deviceId!,
        name: 'Senior\'s Phone',
        pairedAt: new Date().toISOString(),
        lastSync: new Date().toISOString(),
        status: 'online',
        familyMembers: [],
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_INFO, JSON.stringify(newDevice));
      setDeviceInfo(newDevice);
      
      return newDevice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-info'] });
    },
  });
  
  // Store the mutation function in ref
  pairDeviceRef.current = pairDevice.mutate;

  // Authenticate family member
  const authenticateFamilyMember = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Simulate authentication - in production, this would call your backend
      const mockFamilyMember: FamilyMember = {
        id: generateUUID(),
        name: email.split('@')[0],
        email,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      
      const mockSession: DashboardSession = {
        deviceId: deviceId!,
        familyMember: mockFamilyMember,
        token: generateUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.DASHBOARD_SESSION, JSON.stringify(mockSession));
      setSession(mockSession);
      
      return mockSession;
    },
  });
  
  // Store the mutation function in ref
  authenticateFamilyMemberRef.current = authenticateFamilyMember.mutate;

  // Poll for remote commands
  const { data: remoteCommands } = useQuery({
    queryKey: ['remote-commands', deviceId],
    queryFn: async () => {
      // In production, this would fetch from your backend
      // For now, we'll check local storage for pending commands
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_COMMANDS);
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!deviceId && !!deviceInfo,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Process remote command
  const processRemoteCommand = useCallback(async (command: RemoteCommand) => {
    try {
      // Mark command as processing
      const updatedCommands = pendingCommands.map(cmd =>
        cmd.id === command.id ? { ...cmd, status: 'completed' as const } : cmd
      );
      setPendingCommands(updatedCommands);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_COMMANDS, JSON.stringify(updatedCommands));
      
      // In production, you would send the result back to the server
      console.log('Processed command:', command);
      
      return true;
    } catch (error) {
      console.error('Error processing command:', error);
      
      // Mark command as failed
      const updatedCommands = pendingCommands.map(cmd =>
        cmd.id === command.id ? { ...cmd, status: 'failed' as const } : cmd
      );
      setPendingCommands(updatedCommands);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_COMMANDS, JSON.stringify(updatedCommands));
      
      return false;
    }
  }, [pendingCommands]);

  // Add remote command (for testing)
  const addRemoteCommand = useCallback(async (command: Omit<RemoteCommand, 'id' | 'createdAt' | 'status'>) => {
    const newCommand: RemoteCommand = {
      ...command,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    
    const updated = [...pendingCommands, newCommand];
    setPendingCommands(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_COMMANDS, JSON.stringify(updated));
  }, [pendingCommands]);

  // Reminder management functions
  const addReminder = useCallback(async (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...reminders, newReminder];
    setReminders(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
    
    return newReminder;
  }, [reminders]);

  const updateReminder = useCallback(async (id: string, updates: Partial<Reminder>) => {
    const updated = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, ...updates } : reminder
    );
    setReminders(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
  }, [reminders]);

  const deleteReminder = useCallback(async (id: string) => {
    const updated = reminders.filter(reminder => reminder.id !== id);
    setReminders(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
  }, [reminders]);

  // Reminder alert functions
  const triggerReminderAlert = useCallback(async (reminder: Reminder) => {
    const alert: ReminderAlert = {
      id: generateUUID(),
      reminderId: reminder.id,
      reminder,
      triggeredAt: new Date().toISOString(),
      acknowledged: false,
    };
    
    const updated = [...reminderAlerts, alert];
    setReminderAlerts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_ALERTS, JSON.stringify(updated));
    
    return alert;
  }, [reminderAlerts]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    const updated = reminderAlerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );
    setReminderAlerts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_ALERTS, JSON.stringify(updated));
  }, [reminderAlerts]);

  const snoozeAlert = useCallback(async (alertId: string, snoozeMinutes: number) => {
    const snoozeUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000).toISOString();
    const updated = reminderAlerts.map(alert =>
      alert.id === alertId ? { ...alert, snoozedUntil: snoozeUntil } : alert
    );
    setReminderAlerts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_ALERTS, JSON.stringify(updated));
  }, [reminderAlerts]);

  const dismissAlert = useCallback(async (alertId: string) => {
    const updated = reminderAlerts.filter(alert => alert.id !== alertId);
    setReminderAlerts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_ALERTS, JSON.stringify(updated));
  }, [reminderAlerts]);

  // Logout from dashboard
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.DASHBOARD_SESSION);
    setSession(null);
  }, []);

  // Unpair device
  const unpairDevice = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_INFO),
      AsyncStorage.removeItem(STORAGE_KEYS.DASHBOARD_SESSION),
      AsyncStorage.removeItem(STORAGE_KEYS.PENDING_COMMANDS),
      AsyncStorage.removeItem(STORAGE_KEYS.REMINDERS),
      AsyncStorage.removeItem(STORAGE_KEYS.REMINDER_ALERTS),
    ]);
    setDeviceInfo(null);
    setSession(null);
    setPendingCommands([]);
    setReminders([]);
    setReminderAlerts([]);
  }, []);
  
  // Stable wrapper functions for mutations
  const pairDeviceWrapper = useCallback((token: string) => {
    return pairDeviceRef.current?.(token);
  }, []);
  
  const authenticateFamilyMemberWrapper = useCallback((creds: { email: string; password: string }) => {
    return authenticateFamilyMemberRef.current?.(creds);
  }, []);

  return useMemo(() => ({
    deviceId,
    deviceInfo,
    session,
    pendingCommands: remoteCommands || pendingCommands,
    reminders,
    reminderAlerts,
    activeAlerts: reminderAlerts.filter(alert => 
      !alert.acknowledged && 
      (!alert.snoozedUntil || new Date(alert.snoozedUntil) <= new Date())
    ),
    isAuthenticated: !!session,
    isPaired: !!deviceInfo,
    generatePairingCode,
    pairDevice: pairDeviceWrapper,
    authenticateFamilyMember: authenticateFamilyMemberWrapper,
    processRemoteCommand,
    addRemoteCommand,
    addReminder,
    updateReminder,
    deleteReminder,
    triggerReminderAlert,
    acknowledgeAlert,
    snoozeAlert,
    dismissAlert,
    logout,
    unpairDevice,
  }), [
    deviceId,
    deviceInfo,
    session,
    remoteCommands,
    pendingCommands,
    reminders,
    reminderAlerts,
    generatePairingCode,
    pairDeviceWrapper,
    authenticateFamilyMemberWrapper,
    processRemoteCommand,
    addRemoteCommand,
    addReminder,
    updateReminder,
    deleteReminder,
    triggerReminderAlert,
    acknowledgeAlert,
    snoozeAlert,
    dismissAlert,
    logout,
    unpairDevice,
  ]);
});