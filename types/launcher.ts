export interface Contact {
  id: string;
  name: string;
  phone: string;
  isFavorite: boolean;
  isEmergency: boolean;
  photo?: string;
}

export interface AppTile {
  id: string;
  name: string;
  icon: string;
  color: string;
  action: 'phone' | 'messages' | 'camera' | 'photos' | 'weather' | 'news' | 'settings' | 'contacts' | 'apps';
  isVisible: boolean;
  order: number;
}

export interface LauncherSettings {
  textSize: 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  emergencyContact?: Contact;
  favoriteContacts: Contact[];
  visibleApps: string[];
  gridSize: '2x2' | '2x3' | '3x3';
  wellnessChecks: WellnessSettings;
}

export interface WellnessSettings {
  enabled: boolean;
  checkInTime: string; // HH:MM format
  reminderTime: string; // HH:MM format
  familyNotifications: boolean;
  autoCheckThreshold: number; // hours without activity
}

export interface WellnessCheckIn {
  id: string;
  timestamp: string;
  type: 'manual' | 'auto' | 'reminder';
  status: 'ok' | 'needs_help' | 'emergency';
  message?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface WellnessAlert {
  id: string;
  type: 'missed_checkin' | 'no_activity' | 'emergency' | 'help_needed' | 'low_battery' | 'battery_critical' | 'connectivity_lost' | 'connectivity_restored';
  timestamp: string;
  message: string;
  acknowledged: boolean;
  familyMemberIds: string[];
}