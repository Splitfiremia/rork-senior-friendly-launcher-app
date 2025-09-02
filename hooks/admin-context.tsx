import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  AdminUser, 
  AdminSession, 
  SystemStats, 
  UserAccount, 
  SupportTicket, 
  SystemAlert, 
  AnalyticsData, 
  SystemConfig
} from '@/types/admin';

// Pure JavaScript UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const STORAGE_KEYS = {
  ADMIN_SESSION: 'admin_session',
  SYSTEM_CONFIG: 'system_config',
};

// Mock data generators
const generateMockStats = (): SystemStats => ({
  totalUsers: 12847,
  activeDevices: 8932,
  totalDevices: 11234,
  premiumSubscriptions: 3421,
  freeUsers: 9426,
  dailyActiveUsers: 4567,
  monthlyActiveUsers: 10234,
  averageSessionDuration: 23.5,
  supportTickets: {
    open: 23,
    resolved: 156,
    pending: 8,
  },
});

const generateMockUsers = (): UserAccount[] => [
  {
    id: '1',
    email: 'john.doe@email.com',
    name: 'John Doe',
    plan: 'premium',
    subscriptionStatus: 'active',
    subscriptionExpiresAt: '2024-12-31T23:59:59Z',
    createdAt: '2024-01-15T10:30:00Z',
    lastActiveAt: '2024-09-01T14:22:00Z',
    devices: [],
    familyMembers: [],
    totalReminders: 45,
    totalCheckIns: 234,
    supportTickets: 2,
  },
  {
    id: '2',
    email: 'sarah.smith@email.com',
    name: 'Sarah Smith',
    plan: 'free',
    subscriptionStatus: 'active',
    createdAt: '2024-02-20T09:15:00Z',
    lastActiveAt: '2024-08-30T16:45:00Z',
    devices: [],
    familyMembers: [],
    totalReminders: 12,
    totalCheckIns: 89,
    supportTickets: 0,
  },
];

const generateMockTickets = (): SupportTicket[] => [
  {
    id: '1',
    userId: '1',
    userEmail: 'john.doe@email.com',
    userName: 'John Doe',
    subject: 'Unable to add family member',
    description: 'I am trying to add my daughter as a family member but the invitation is not being sent.',
    status: 'open',
    priority: 'medium',
    category: 'technical',
    createdAt: '2024-09-01T10:30:00Z',
    updatedAt: '2024-09-01T10:30:00Z',
    messages: [],
  },
  {
    id: '2',
    userId: '2',
    userEmail: 'sarah.smith@email.com',
    userName: 'Sarah Smith',
    subject: 'Billing question about premium upgrade',
    description: 'I want to upgrade to premium but I have questions about the billing cycle.',
    status: 'in_progress',
    priority: 'low',
    category: 'billing',
    assignedTo: 'admin-1',
    createdAt: '2024-08-30T14:20:00Z',
    updatedAt: '2024-09-01T09:15:00Z',
    messages: [],
  },
];

const generateMockAlerts = (): SystemAlert[] => [
  {
    id: '1',
    type: 'warning',
    title: 'High Server Load',
    message: 'Server CPU usage is above 80% for the last 15 minutes',
    severity: 'medium',
    source: 'monitoring',
    status: 'active',
    createdAt: '2024-09-02T08:30:00Z',
  },
  {
    id: '2',
    type: 'info',
    title: 'Scheduled Maintenance',
    message: 'Database maintenance scheduled for tonight at 2 AM EST',
    severity: 'low',
    source: 'system',
    status: 'active',
    createdAt: '2024-09-01T16:00:00Z',
  },
];

export const [AdminProvider, useAdmin] = createContextHook(() => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const queryClient = useQueryClient();

  // Initialize admin session
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const [storedSession, storedConfig] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ADMIN_SESSION),
        AsyncStorage.getItem(STORAGE_KEYS.SYSTEM_CONFIG),
      ]);

      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        if (new Date(parsedSession.expiresAt) > new Date()) {
          setSession(parsedSession);
        } else {
          await AsyncStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
        }
      }

      if (storedConfig) {
        setSystemConfig(JSON.parse(storedConfig));
      } else {
        // Set default config
        const defaultConfig: SystemConfig = {
          maintenanceMode: false,
          allowNewRegistrations: true,
          maxDevicesPerUser: 5,
          maxFamilyMembersPerDevice: 10,
          supportEmail: 'support@careconnect.app',
          privacyPolicyUrl: 'https://careconnect.app/privacy',
          termsOfServiceUrl: 'https://careconnect.app/terms',
          features: {
            remoteReminders: true,
            batteryMonitoring: true,
            photoSharing: true,
            emergencyContacts: true,
            wellnessChecks: true,
          },
          notifications: {
            emailEnabled: true,
            pushEnabled: true,
            smsEnabled: false,
          },
        };
        setSystemConfig(defaultConfig);
        await AsyncStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Error initializing admin session:', error);
    }
  };

  // Admin authentication
  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Simulate admin authentication
      if (email === 'admin@careconnect.app' && password === 'admin123') {
        const adminUser: AdminUser = {
          id: 'admin-1',
          email,
          name: 'System Administrator',
          role: 'super_admin',
          createdAt: '2024-01-01T00:00:00Z',
          lastLogin: new Date().toISOString(),
          isActive: true,
        };

        const adminSession: AdminSession = {
          user: adminUser,
          token: generateUUID(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        };

        await AsyncStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(adminSession));
        setSession(adminSession);
        return adminSession;
      }
      throw new Error('Invalid credentials');
    },
  });

  // Logout
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    setSession(null);
  }, []);

  // System stats query
  const { data: systemStats, refetch: refetchStats } = useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: async () => generateMockStats(),
    enabled: !!session,
    refetchInterval: 60000, // Refresh every minute
  });

  // Users query
  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => generateMockUsers(),
    enabled: !!session,
  });

  // Support tickets query
  const { data: supportTickets, refetch: refetchTickets } = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: async () => generateMockTickets(),
    enabled: !!session,
  });

  // System alerts query
  const { data: systemAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['admin-system-alerts'],
    queryFn: async () => generateMockAlerts(),
    enabled: !!session,
  });

  // Analytics data query
  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      // Generate mock analytics data
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      return {
        userGrowth: dates.map((date, i) => ({
          date,
          newUsers: Math.floor(Math.random() * 50) + 10,
          totalUsers: 10000 + i * 20,
        })),
        deviceUsage: dates.map(date => ({
          date,
          activeDevices: Math.floor(Math.random() * 1000) + 5000,
          totalSessions: Math.floor(Math.random() * 2000) + 8000,
          averageSessionDuration: Math.floor(Math.random() * 30) + 15,
        })),
        featureUsage: [
          { feature: 'Remote Reminders', usageCount: 15420, uniqueUsers: 3240 },
          { feature: 'Battery Monitoring', usageCount: 12890, uniqueUsers: 4120 },
          { feature: 'Wellness Checks', usageCount: 9870, uniqueUsers: 2890 },
          { feature: 'Photo Sharing', usageCount: 7650, uniqueUsers: 2340 },
          { feature: 'Emergency Contacts', usageCount: 11230, uniqueUsers: 3890 },
        ],
        subscriptionMetrics: dates.map(date => ({
          date,
          newSubscriptions: Math.floor(Math.random() * 20) + 5,
          cancellations: Math.floor(Math.random() * 10) + 2,
          revenue: Math.floor(Math.random() * 1000) + 500,
        })),
        supportMetrics: dates.map(date => ({
          date,
          newTickets: Math.floor(Math.random() * 15) + 3,
          resolvedTickets: Math.floor(Math.random() * 12) + 5,
          averageResolutionTime: Math.floor(Math.random() * 48) + 12,
        })),
      };
    },
    enabled: !!session,
  });

  // Update system config
  const updateSystemConfig = useMutation({
    mutationFn: async (updates: Partial<SystemConfig>) => {
      if (!systemConfig) throw new Error('System config not initialized');
      const updatedConfig = { ...systemConfig, ...updates } as SystemConfig;
      await AsyncStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, JSON.stringify(updatedConfig));
      setSystemConfig(updatedConfig);
      return updatedConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-config'] });
    },
  });

  // Update support ticket
  const updateSupportTicket = useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: Partial<SupportTicket> }) => {
      // In production, this would call your backend API
      console.log('Updating ticket:', ticketId, updates);
      return { ticketId, updates };
    },
    onSuccess: () => {
      refetchTickets();
    },
  });

  // Resolve system alert
  const resolveSystemAlert = useMutation({
    mutationFn: async (alertId: string) => {
      // In production, this would call your backend API
      console.log('Resolving alert:', alertId);
      return alertId;
    },
    onSuccess: () => {
      refetchAlerts();
    },
  });

  // Suspend user account
  const suspendUser = useMutation({
    mutationFn: async (userId: string) => {
      // In production, this would call your backend API
      console.log('Suspending user:', userId);
      return userId;
    },
    onSuccess: () => {
      refetchUsers();
    },
  });

  // Send system notification
  const sendSystemNotification = useMutation({
    mutationFn: async ({ 
      userIds, 
      title, 
      message, 
      type 
    }: { 
      userIds: string[]; 
      title: string; 
      message: string; 
      type: 'info' | 'warning' | 'maintenance' 
    }) => {
      // In production, this would call your backend API
      console.log('Sending notification:', { userIds, title, message, type });
      return { userIds, title, message, type };
    },
  });

  return useMemo(() => ({
    session,
    systemStats,
    users: users || [],
    supportTickets: supportTickets || [],
    systemAlerts: systemAlerts || [],
    analyticsData,
    systemConfig,
    isAuthenticated: !!session,
    isAdmin: session?.user.role === 'super_admin' || session?.user.role === 'admin',
    isSuperAdmin: session?.user.role === 'super_admin',
    login: login.mutate,
    logout,
    updateSystemConfig: updateSystemConfig.mutate,
    updateSupportTicket: updateSupportTicket.mutate,
    resolveSystemAlert: resolveSystemAlert.mutate,
    suspendUser: suspendUser.mutate,
    sendSystemNotification: sendSystemNotification.mutate,
    refetchStats,
    refetchUsers,
    refetchTickets,
    refetchAlerts,
    isLoading: login.isPending || updateSystemConfig.isPending,
  }), [
    session,
    systemStats,
    users,
    supportTickets,
    systemAlerts,
    analyticsData,
    systemConfig,
    login.mutate,
    logout,
    updateSystemConfig.mutate,
    updateSupportTicket.mutate,
    resolveSystemAlert.mutate,
    suspendUser.mutate,
    sendSystemNotification.mutate,
    refetchStats,
    refetchUsers,
    refetchTickets,
    refetchAlerts,
    login.isPending,
    updateSystemConfig.isPending,
  ]);
});