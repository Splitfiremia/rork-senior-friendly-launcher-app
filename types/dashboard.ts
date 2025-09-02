export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
}

export interface Device {
  id: string;
  name: string;
  pairedAt: string;
  lastSync: string;
  status: 'online' | 'offline';
  familyMembers: string[];
}

export interface DashboardSession {
  deviceId: string;
  familyMember: FamilyMember;
  token: string;
  expiresAt: string;
}

export interface RemoteCommand {
  id: string;
  type: 'add_contact' | 'update_contact' | 'delete_contact' | 'update_settings' | 'add_app' | 'remove_app' | 'add_reminder' | 'update_reminder' | 'delete_reminder';
  payload: any;
  createdBy: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface Reminder {
  id: string;
  type: 'medication' | 'appointment';
  title: string;
  description?: string;
  time: string; // ISO string for scheduled time
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    days?: number[]; // 0-6 for weekly (0 = Sunday)
    endDate?: string;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastTriggered?: string;
  acknowledged?: boolean;
  snoozeUntil?: string;
}

export interface ReminderAlert {
  id: string;
  reminderId: string;
  reminder: Reminder;
  triggeredAt: string;
  acknowledged: boolean;
  snoozedUntil?: string;
}