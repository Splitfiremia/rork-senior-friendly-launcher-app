import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAdmin } from '@/hooks/admin-context';
import {
  Shield,
  Users,
  Activity,
  AlertTriangle,
  Settings,
  BarChart3,
  MessageSquare,
  LogOut,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Smartphone,
  CheckCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const {
    session,
    systemStats,
    users,
    supportTickets,
    systemAlerts,
    analyticsData,
    systemConfig,
    isAuthenticated,

    login,
    logout,
    refetchStats,
    refetchUsers,
    refetchTickets,
    refetchAlerts,
    isLoading,
  } = useAdmin();

  const [email, setEmail] = useState('admin@careconnect.app');
  const [password, setPassword] = useState('admin123');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'support' | 'analytics' | 'settings'>('overview');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      await login({ email, password });
      Alert.alert('Success', 'Logged in successfully');
    } catch {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  const handleRefresh = () => {
    refetchStats();
    refetchUsers();
    refetchTickets();
    refetchAlerts();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            title: 'CareConnect Admin',
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        
        <View style={styles.loginContainer}>
          <View style={styles.loginCard}>
            <View style={styles.loginHeader}>
              <Shield size={32} color="#4A90E2" />
              <Text style={styles.loginTitle}>Admin Login</Text>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="admin-email-input"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              testID="admin-password-input"
            />
            
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              testID="admin-login-button"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.loginHint}>
              Demo credentials: admin@careconnect.app / admin123
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      {/* System Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Users size={24} color="#4A90E2" />
          <Text style={styles.statNumber}>{systemStats?.totalUsers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        
        <View style={styles.statCard}>
          <Smartphone size={24} color="#27AE60" />
          <Text style={styles.statNumber}>{systemStats?.activeDevices.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Active Devices</Text>
        </View>
        
        <View style={styles.statCard}>
          <DollarSign size={24} color="#F39C12" />
          <Text style={styles.statNumber}>{systemStats?.premiumSubscriptions.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Premium Users</Text>
        </View>
        
        <View style={styles.statCard}>
          <MessageSquare size={24} color="#E74C3C" />
          <Text style={styles.statNumber}>{systemStats?.supportTickets.open}</Text>
          <Text style={styles.statLabel}>Open Tickets</Text>
        </View>
      </View>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>System Alerts</Text>
          {systemAlerts.slice(0, 3).map((alert) => (
            <View key={alert.id} style={[styles.alertCard, styles[`alert${alert.severity}`]]}>
              <View style={styles.alertHeader}>
                <AlertTriangle size={20} color={alert.type === 'error' ? '#E74C3C' : '#F39C12'} />
                <Text style={styles.alertTitle}>{alert.title}</Text>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>
                {new Date(alert.createdAt).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <TrendingUp size={16} color="#27AE60" />
            <Text style={styles.activityText}>Daily active users increased by 12%</Text>
          </View>
          <View style={styles.activityItem}>
            <CheckCircle size={16} color="#4A90E2" />
            <Text style={styles.activityText}>5 support tickets resolved today</Text>
          </View>
          <View style={styles.activityItem}>
            <Users size={16} color="#F39C12" />
            <Text style={styles.activityText}>23 new user registrations</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderUsers = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.usersHeader}>
        <Text style={styles.sectionTitle}>User Management</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => refetchUsers()}>
          <RefreshCw size={16} color="#4A90E2" />
        </TouchableOpacity>
      </View>
      
      {users.map((user) => (
        <View key={user.id} style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.userMeta}>
              <View style={[styles.planBadge, user.plan === 'premium' ? styles.premiumBadge : styles.freeBadge]}>
                <Text style={[styles.planText, user.plan === 'premium' ? styles.premiumText : styles.freeText]}>
                  {user.plan.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userDate}>
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.userStats}>
            <Text style={styles.userStatText}>{user.totalReminders} reminders</Text>
            <Text style={styles.userStatText}>{user.totalCheckIns} check-ins</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderSupport = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.supportHeader}>
        <Text style={styles.sectionTitle}>Support Tickets</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => refetchTickets()}>
          <RefreshCw size={16} color="#4A90E2" />
        </TouchableOpacity>
      </View>
      
      {supportTickets.map((ticket) => (
        <View key={ticket.id} style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketSubject}>{ticket.subject}</Text>
            <View style={[styles.statusBadge, styles[`status${ticket.status}`]]}>
              <Text style={styles.statusText}>{ticket.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.ticketUser}>{ticket.userName} ({ticket.userEmail})</Text>
          <Text style={styles.ticketDescription} numberOfLines={2}>
            {ticket.description}
          </Text>
          <View style={styles.ticketMeta}>
            <View style={[styles.priorityBadge, styles[`priority${ticket.priority}`]]}>
              <Text style={styles.priorityText}>{ticket.priority.toUpperCase()}</Text>
            </View>
            <Text style={styles.ticketDate}>
              {new Date(ticket.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Analytics Overview</Text>
      
      {/* Feature Usage */}
      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsTitle}>Feature Usage</Text>
        {analyticsData?.featureUsage.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureName}>{feature.feature}</Text>
            <View style={styles.featureStats}>
              <Text style={styles.featureUsage}>{feature.usageCount.toLocaleString()} uses</Text>
              <Text style={styles.featureUsers}>{feature.uniqueUsers.toLocaleString()} users</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Growth Metrics */}
      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsTitle}>Growth Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>+{systemStats?.dailyActiveUsers}</Text>
            <Text style={styles.metricLabel}>Daily Active Users</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>+{systemStats?.monthlyActiveUsers}</Text>
            <Text style={styles.metricLabel}>Monthly Active Users</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>System Configuration</Text>
      
      <View style={styles.configSection}>
        <Text style={styles.configTitle}>System Status</Text>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Maintenance Mode</Text>
          <View style={[styles.statusIndicator, systemConfig?.maintenanceMode ? styles.statusError : styles.statusSuccess]}>
            <Text style={styles.statusText}>
              {systemConfig?.maintenanceMode ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>New Registrations</Text>
          <View style={[styles.statusIndicator, systemConfig?.allowNewRegistrations ? styles.statusSuccess : styles.statusError]}>
            <Text style={styles.statusText}>
              {systemConfig?.allowNewRegistrations ? 'ENABLED' : 'DISABLED'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.configSection}>
        <Text style={styles.configTitle}>Limits</Text>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Max Devices per User</Text>
          <Text style={styles.configValue}>{systemConfig?.maxDevicesPerUser}</Text>
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Max Family Members per Device</Text>
          <Text style={styles.configValue}>{systemConfig?.maxFamilyMembersPerDevice}</Text>
        </View>
      </View>

      <View style={styles.configSection}>
        <Text style={styles.configTitle}>Features</Text>
        {systemConfig?.features && Object.entries(systemConfig.features).map(([key, enabled]) => (
          <View key={key} style={styles.configItem}>
            <Text style={styles.configLabel}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
            <View style={[styles.statusIndicator, enabled ? styles.statusSuccess : styles.statusError]}>
              <Text style={styles.statusText}>{enabled ? 'ON' : 'OFF'}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'CareConnect Admin',
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={handleRefresh}>
                <RefreshCw size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={logout}>
                <LogOut size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Admin Info */}
      <View style={styles.adminInfo}>
        <Text style={styles.adminName}>Welcome, {session?.user.name}</Text>
        <Text style={styles.adminRole}>{session?.user.role.replace('_', ' ').toUpperCase()}</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Activity size={20} color={activeTab === 'overview' ? '#4A90E2' : '#7F8C8D'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Users size={20} color={activeTab === 'users' ? '#4A90E2' : '#7F8C8D'} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'support' && styles.activeTab]}
          onPress={() => setActiveTab('support')}
        >
          <MessageSquare size={20} color={activeTab === 'support' ? '#4A90E2' : '#7F8C8D'} />
          <Text style={[styles.tabText, activeTab === 'support' && styles.activeTabText]}>
            Support
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <BarChart3 size={20} color={activeTab === 'analytics' ? '#4A90E2' : '#7F8C8D'} />
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Settings size={20} color={activeTab === 'settings' ? '#4A90E2' : '#7F8C8D'} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'support' && renderSupport()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#2C3E50',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginHint: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  adminInfo: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  adminRole: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4A90E2',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: (width - 50) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
    textAlign: 'center',
  },
  alertsSection: {
    marginBottom: 20,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  alertlow: {
    borderLeftColor: '#3498DB',
  },
  alertmedium: {
    borderLeftColor: '#F39C12',
  },
  alerthigh: {
    borderLeftColor: '#E74C3C',
  },
  alertcritical: {
    borderLeftColor: '#8E44AD',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  activitySection: {
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 10,
  },
  usersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshButton: {
    padding: 8,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  userEmail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadge: {
    backgroundColor: '#F39C12',
  },
  freeBadge: {
    backgroundColor: '#95A5A6',
  },
  planText: {
    fontSize: 10,
    fontWeight: '600',
  },
  premiumText: {
    color: '#FFFFFF',
  },
  freeText: {
    color: '#FFFFFF',
  },
  userDate: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  userStats: {
    flexDirection: 'row',
    gap: 15,
  },
  userStatText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  supportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusopen: {
    backgroundColor: '#E74C3C',
  },
  statusin_progress: {
    backgroundColor: '#F39C12',
  },
  statusresolved: {
    backgroundColor: '#27AE60',
  },
  statusclosed: {
    backgroundColor: '#95A5A6',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ticketUser: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 10,
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  prioritylow: {
    backgroundColor: '#3498DB',
  },
  prioritymedium: {
    backgroundColor: '#F39C12',
  },
  priorityhigh: {
    backgroundColor: '#E74C3C',
  },
  priorityurgent: {
    backgroundColor: '#8E44AD',
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ticketDate: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  analyticsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  featureName: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  featureStats: {
    alignItems: 'flex-end',
  },
  featureUsage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  featureUsers: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  metricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
    textAlign: 'center',
  },
  configSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  configLabel: {
    fontSize: 14,
    color: '#2C3E50',
  },
  configValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusSuccess: {
    backgroundColor: '#27AE60',
  },
  statusError: {
    backgroundColor: '#E74C3C',
  },
});