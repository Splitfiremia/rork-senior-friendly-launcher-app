export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'support';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  expiresAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeDevices: number;
  totalDevices: number;
  premiumSubscriptions: number;
  freeUsers: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  supportTickets: {
    open: number;
    resolved: number;
    pending: number;
  };
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'premium';
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'trial';
  subscriptionExpiresAt?: string;
  createdAt: string;
  lastActiveAt?: string;
  devices: DeviceInfo[];
  familyMembers: FamilyMemberInfo[];
  totalReminders: number;
  totalCheckIns: number;
  supportTickets: number;
}

export interface DeviceInfo {
  id: string;
  name: string;
  userId: string;
  status: 'online' | 'offline' | 'inactive';
  lastSync: string;
  batteryLevel?: number;
  osVersion?: string;
  appVersion: string;
  location?: {
    city: string;
    country: string;
  };
  pairedAt: string;
  totalUsageHours: number;
}

export interface FamilyMemberInfo {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  userId: string;
  addedAt: string;
  lastActiveAt?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'admin';
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: 'system' | 'user_report' | 'monitoring';
  affectedUsers?: number;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AnalyticsData {
  userGrowth: {
    date: string;
    newUsers: number;
    totalUsers: number;
  }[];
  deviceUsage: {
    date: string;
    activeDevices: number;
    totalSessions: number;
    averageSessionDuration: number;
  }[];
  featureUsage: {
    feature: string;
    usageCount: number;
    uniqueUsers: number;
  }[];
  subscriptionMetrics: {
    date: string;
    newSubscriptions: number;
    cancellations: number;
    revenue: number;
  }[];
  supportMetrics: {
    date: string;
    newTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number;
  }[];
}

export interface BillingInfo {
  userId: string;
  subscriptionId: string;
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  paymentMethod?: {
    type: 'card' | 'paypal';
    last4?: string;
    brand?: string;
  };
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  createdAt: string;
  paidAt?: string;
  dueDate: string;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  maxDevicesPerUser: number;
  maxFamilyMembersPerDevice: number;
  supportEmail: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  features: {
    remoteReminders: boolean;
    batteryMonitoring: boolean;
    photoSharing: boolean;
    emergencyContacts: boolean;
    wellnessChecks: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  };
}