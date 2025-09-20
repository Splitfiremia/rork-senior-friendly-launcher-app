import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { DEFAULT_APP_TILES, SAMPLE_CONTACTS } from '@/constants/launcher-config';
import { AppTile, Contact, LauncherSettings, WellnessCheckIn, WellnessAlert } from '@/types/launcher';


const STORAGE_KEYS = {
  SETTINGS: 'launcher_settings',
  CONTACTS: 'launcher_contacts',
  APP_TILES: 'launcher_app_tiles',
  WELLNESS_CHECKINS: 'wellness_checkins',
  WELLNESS_ALERTS: 'wellness_alerts',
  LAST_ACTIVITY: 'last_activity',
};

export const [LauncherProvider, useLauncher] = createContextHook(() => {
  const [settings, setSettings] = useState<LauncherSettings>({
    textSize: 'large',
    highContrast: false,
    favoriteContacts: [],
    visibleApps: DEFAULT_APP_TILES.filter(app => app.isVisible).map(app => app.id),
    gridSize: '2x2',
    wellnessChecks: {
      enabled: true,
      checkInTime: '09:00',
      reminderTime: '18:00',
      familyNotifications: true,
      autoCheckThreshold: 24,
    },
  });

  const [contacts, setContacts] = useState<Contact[]>(SAMPLE_CONTACTS);
  const [appTiles, setAppTiles] = useState<AppTile[]>(DEFAULT_APP_TILES);
  const [wellnessCheckIns, setWellnessCheckIns] = useState<WellnessCheckIn[]>([]);
  const [wellnessAlerts, setWellnessAlerts] = useState<WellnessAlert[]>([]);
  const [lastActivity, setLastActivity] = useState<string>(new Date().toISOString());
  const [isLoading, setIsLoading] = useState(true);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const [
        savedSettings,
        savedContacts,
        savedAppTiles,
        savedCheckIns,
        savedAlerts,
        savedLastActivity,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS),
        AsyncStorage.getItem(STORAGE_KEYS.APP_TILES),
        AsyncStorage.getItem(STORAGE_KEYS.WELLNESS_CHECKINS),
        AsyncStorage.getItem(STORAGE_KEYS.WELLNESS_ALERTS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY),
      ]);

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Ensure wellness settings exist with defaults
        if (!parsed.wellnessChecks) {
          parsed.wellnessChecks = {
            enabled: true,
            checkInTime: '09:00',
            reminderTime: '18:00',
            familyNotifications: true,
            autoCheckThreshold: 24,
          };
        }
        setSettings(parsed);
      }

      if (savedContacts) {
        const parsed = JSON.parse(savedContacts);
        setContacts(parsed);
      }

      if (savedAppTiles) {
        const parsed = JSON.parse(savedAppTiles);
        setAppTiles(parsed);
      }

      if (savedCheckIns) {
        const parsed = JSON.parse(savedCheckIns);
        setWellnessCheckIns(parsed);
      }

      if (savedAlerts) {
        const parsed = JSON.parse(savedAlerts);
        setWellnessAlerts(parsed);
      }

      if (savedLastActivity) {
        setLastActivity(savedLastActivity);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<LauncherSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  };

  const updateContacts = async (newContacts: Contact[]) => {
    setContacts(newContacts);
    await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(newContacts));
  };

  const addContact = async (contact: Contact) => {
    const updated = [...contacts, contact];
    await updateContacts(updated);
  };

  const updateContact = async (contactId: string, updates: Partial<Contact>) => {
    const updated = contacts.map(c => 
      c.id === contactId ? { ...c, ...updates } : c
    );
    await updateContacts(updated);
  };

  const deleteContact = async (contactId: string) => {
    const updated = contacts.filter(c => c.id !== contactId);
    await updateContacts(updated);
  };

  const toggleFavoriteContact = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      await updateContact(contactId, { isFavorite: !contact.isFavorite });
    }
  };

  const setEmergencyContact = async (contactId: string) => {
    const updated = contacts.map(c => ({
      ...c,
      isEmergency: c.id === contactId,
    }));
    await updateContacts(updated);
  };

  const updateAppTiles = async (newTiles: AppTile[]) => {
    setAppTiles(newTiles);
    await AsyncStorage.setItem(STORAGE_KEYS.APP_TILES, JSON.stringify(newTiles));
  };

  const toggleAppVisibility = async (appId: string) => {
    const updated = appTiles.map(tile =>
      tile.id === appId ? { ...tile, isVisible: !tile.isVisible } : tile
    );
    await updateAppTiles(updated);
  };

  const reorderAppTiles = async (tiles: AppTile[]) => {
    await updateAppTiles(tiles);
  };

  // Wellness check functions
  const recordActivity = async () => {
    const now = new Date().toISOString();
    setLastActivity(now);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now);
  };

  const addWellnessCheckIn = async (checkIn: Omit<WellnessCheckIn, 'id' | 'timestamp'>) => {
    const newCheckIn: WellnessCheckIn = {
      ...checkIn,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    const updated = [newCheckIn, ...wellnessCheckIns].slice(0, 50); // Keep last 50 check-ins
    setWellnessCheckIns(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_CHECKINS, JSON.stringify(updated));
    
    // Record activity
    await recordActivity();
    
    return newCheckIn;
  };

  const addWellnessAlert = async (alert: Omit<WellnessAlert, 'id' | 'timestamp'>) => {
    const newAlert: WellnessAlert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    const updated = [newAlert, ...wellnessAlerts];
    setWellnessAlerts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_ALERTS, JSON.stringify(updated));
    
    return newAlert;
  };

  const acknowledgeAlert = async (alertId: string) => {
    const updated = wellnessAlerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );
    setWellnessAlerts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_ALERTS, JSON.stringify(updated));
  };

  const getTodaysCheckIn = () => {
    const today = new Date().toDateString();
    return wellnessCheckIns.find(checkIn => 
      new Date(checkIn.timestamp).toDateString() === today
    );
  };

  const getHoursSinceLastActivity = () => {
    const now = new Date();
    const lastActivityDate = new Date(lastActivity);
    return Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60));
  };

  const resetToDefaults = async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS),
      AsyncStorage.removeItem(STORAGE_KEYS.CONTACTS),
      AsyncStorage.removeItem(STORAGE_KEYS.APP_TILES),
    ]);
    
    setSettings({
      textSize: 'large',
      highContrast: false,
      favoriteContacts: [],
      visibleApps: DEFAULT_APP_TILES.filter(app => app.isVisible).map(app => app.id),
      gridSize: '2x2',
      wellnessChecks: {
        enabled: true,
        checkInTime: '09:00',
        reminderTime: '18:00',
        familyNotifications: true,
        autoCheckThreshold: 24,
      },
    });
    setContacts(SAMPLE_CONTACTS);
    setAppTiles(DEFAULT_APP_TILES);
    setWellnessCheckIns([]);
    setWellnessAlerts([]);
    setLastActivity(new Date().toISOString());
  };

  // Guardian status will be managed by dashboard context
  const isGuardianActive = false;

  return {
    settings,
    contacts,
    appTiles,
    wellnessCheckIns,
    wellnessAlerts,
    lastActivity,
    isLoading,
    isGuardianActive,
    updateSettings,
    addContact,
    updateContact,
    deleteContact,
    toggleFavoriteContact,
    setEmergencyContact,
    toggleAppVisibility,
    reorderAppTiles,
    resetToDefaults,
    recordActivity,
    addWellnessCheckIn,
    addWellnessAlert,
    acknowledgeAlert,
    getTodaysCheckIn,
    getHoursSinceLastActivity,
  };
});

export const useFavoriteContacts = () => {
  const { contacts } = useLauncher();
  return contacts.filter(c => c.isFavorite);
};

export const useEmergencyContact = () => {
  const { contacts } = useLauncher();
  return contacts.find(c => c.isEmergency);
};

export const useVisibleAppTiles = () => {
  const { appTiles } = useLauncher();
  return appTiles.filter(tile => tile.isVisible).sort((a, b) => a.order - b.order);
};