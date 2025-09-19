import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Users,
  Shield,
  Settings,
  Battery,
  Bell,
  Heart,
  Phone,
  ArrowLeft,
  Plus,
  Trash2,
  Smartphone,
  Link,
  LogOut,
} from 'lucide-react-native';
import { useDashboard } from '@/hooks/dashboard-context';
import { useAdmin } from '@/hooks/admin-context';
import { COLORS, TEXT_SIZES } from '@/constants/launcher-config';
import { useLauncher } from '@/hooks/launcher-context';

type TabType = 'family' | 'admin' | 'settings';

export default function DashboardScreen() {
  const router = useRouter();
  const { settings } = useLauncher();
  const textSizes = TEXT_SIZES[settings.textSize];
  const [activeTab, setActiveTab] = useState<TabType>('family');
  const [pairingCode, setPairingCode] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Dashboard context
  const {
    deviceId,
    deviceInfo,
    session,
    isAuthenticated,
    isPaired,
    generatePairingCode,
    pairDevice,
    authenticateFamilyMember,
    reminders,
    activeAlerts,
    addReminder,
    deleteReminder,
    acknowledgeAlert,
    logout: dashboardLogout,
    unpairDevice,
  } = useDashboard();

  // Admin context
  const {
    session: adminSession,
    systemStats,
    isAuthenticated: isAdminAuthenticated,
    login: adminLogin,
    logout: adminLogout,
  } = useAdmin();

  const handlePairDevice = async () => {
    if (!pairingCode.trim()) {
      Alert.alert('Error', 'Please enter a pairing code');
      return;
    }
    
    try {
      await pairDevice(pairingCode);
      Alert.alert('Success', 'Device paired successfully!');
      setPairingCode('');
    } catch (error) {
      Alert.alert('Error', 'Failed to pair device. Please check the pairing code.');
    }
  };

  const handleAuthenticateFamily = async () => {
    if (!adminEmail.trim() || !adminPassword.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    try {
      await authenticateFamilyMember({ email: adminEmail, password: adminPassword });
      Alert.alert('Success', 'Authenticated successfully!');
      setAdminEmail('');
      setAdminPassword('');
    } catch (error) {
      Alert.alert('Error', 'Authentication failed. Please check your credentials.');
    }
  };

  const handleAdminLogin = async () => {
    if (!adminEmail.trim() || !adminPassword.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    try {
      await adminLogin({ email: adminEmail, password: adminPassword });
      Alert.alert('Success', 'Admin login successful!');
      setAdminEmail('');
      setAdminPassword('');
    } catch (error) {
      Alert.alert('Error', 'Admin login failed. Please check your credentials.');
    }
  };

  const handleAddReminder = () => {
    if (Platform.OS === 'web') {
      const text = prompt('Enter reminder text:');
      if (text?.trim()) {
        addReminderWithText(text);
      }
    } else {
      Alert.prompt(
        'Add Reminder',
        'Enter reminder text:',
        async (text) => {
          if (text?.trim()) {
            addReminderWithText(text);
          }
        }
      );
    }
  };

  const addReminderWithText = async (text: string) => {
    try {
      await addReminder({
        type: 'medication',
        title: text,
        description: text,
        time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        isActive: true,
        createdBy: session?.familyMember.id || 'unknown',
      });
      Alert.alert('Success', 'Reminder added!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add reminder');
    }
  };

  const TabButton = ({ tab, title, icon: Icon }: { tab: TabType; title: string; icon: React.ComponentType<any> }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon 
        color={activeTab === tab ? COLORS.primary : COLORS.textSecondary} 
        size={20} 
      />
      <Text 
        style={[
          styles.tabButtonText, 
          { fontSize: textSizes.body },
          activeTab === tab && styles.activeTabButtonText
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderFamilyTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>Device Status</Text>
        
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <Smartphone size={24} color={COLORS.primary} />
            <Text style={[styles.cardTitle, { fontSize: textSizes.subtitle }]}>Device Information</Text>
          </View>
          
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { fontSize: textSizes.body }]}>Device ID:</Text>
            <Text style={[styles.statusValue, { fontSize: textSizes.body }]}>{deviceId || 'Not initialized'}</Text>
          </View>
          
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { fontSize: textSizes.body }]}>Status:</Text>
            <Text style={[
              styles.statusValue, 
              { fontSize: textSizes.body },
              isPaired ? styles.statusOnline : styles.statusOffline
            ]}>
              {isPaired ? 'Paired' : 'Not Paired'}
            </Text>
          </View>
          
          {deviceInfo && (
            <>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusLabel, { fontSize: textSizes.body }]}>Name:</Text>
                <Text style={[styles.statusValue, { fontSize: textSizes.body }]}>{deviceInfo.name}</Text>
              </View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusLabel, { fontSize: textSizes.body }]}>Last Sync:</Text>
                <Text style={[styles.statusValue, { fontSize: textSizes.body }]}>
                  {new Date(deviceInfo.lastSync).toLocaleString()}
                </Text>
              </View>
            </>
          )}
        </View>
        
        {!isPaired && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontSize: textSizes.subtitle }]}>Pair Device</Text>
            <Text style={[styles.cardText, { fontSize: textSizes.body }]}>
              Enter the pairing code from your family member&apos;s device:
            </Text>
            <TextInput
              style={[styles.input, { fontSize: textSizes.body }]}
              placeholder="Enter pairing code"
              value={pairingCode}
              onChangeText={setPairingCode}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handlePairDevice}>
              <Text style={[styles.primaryButtonText, { fontSize: textSizes.button }]}>Pair Device</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <Text style={[styles.cardText, { fontSize: textSizes.body }]}>
              Or generate a pairing code for others to scan:
            </Text>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => {
                const code = generatePairingCode();
                if (code) {
                  Alert.alert('Pairing Code', code);
                }
              }}
            >
              <Text style={[styles.secondaryButtonText, { fontSize: textSizes.button }]}>Generate Code</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!isAuthenticated && isPaired && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontSize: textSizes.subtitle }]}>Family Access</Text>
            <Text style={[styles.cardText, { fontSize: textSizes.body }]}>
              Sign in to manage reminders and monitor wellness:
            </Text>
            <TextInput
              style={[styles.input, { fontSize: textSizes.body }]}
              placeholder="Email"
              value={adminEmail}
              onChangeText={setAdminEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { fontSize: textSizes.body }]}
              placeholder="Password"
              value={adminPassword}
              onChangeText={setAdminPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleAuthenticateFamily}>
              <Text style={[styles.primaryButtonText, { fontSize: textSizes.button }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isAuthenticated && (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>Active Alerts</Text>
            {activeAlerts.length === 0 ? (
              <View style={styles.card}>
                <Text style={[styles.cardText, { fontSize: textSizes.body }]}>No active alerts</Text>
              </View>
            ) : (
              activeAlerts.map((alert) => (
                <View key={alert.id} style={[styles.card, styles.alertCard]}>
                  <Text style={[styles.cardTitle, { fontSize: textSizes.subtitle }]}>
                    {alert.reminder.title}
                  </Text>
                  <Text style={[styles.cardText, { fontSize: textSizes.body }]}>
                    {alert.reminder.description || 'No description'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={() => acknowledgeAlert(alert.id)}
                  >
                    <Text style={[styles.primaryButtonText, { fontSize: textSizes.button }]}>Acknowledge</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>Reminders</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
                <Plus color={COLORS.primary} size={24} />
              </TouchableOpacity>
            </View>
            
            {reminders.length === 0 ? (
              <View style={styles.card}>
                <Text style={[styles.cardText, { fontSize: textSizes.body }]}>No reminders set</Text>
              </View>
            ) : (
              reminders.map((reminder) => (
                <View key={reminder.id} style={styles.card}>
                  <View style={styles.reminderHeader}>
                    <Text style={[styles.cardTitle, { fontSize: textSizes.subtitle }]}>
                      {reminder.title}
                    </Text>
                    <TouchableOpacity onPress={() => deleteReminder(reminder.id)}>
                      <Trash2 color={COLORS.error} size={20} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.cardText, { fontSize: textSizes.body }]}>
                    {reminder.description || 'No description'}
                  </Text>
                  <Text style={[styles.cardText, { fontSize: textSizes.body - 2 }]}>
                    Scheduled: {new Date(reminder.time).toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderAdminTab = () => (
    <ScrollView style={styles.tabContent}>
      {!isAdminAuthenticated ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>Admin Login</Text>
          <View style={styles.card}>
            <Text style={[styles.cardText, { fontSize: textSizes.body }]}>
              Use admin@careconnect.app / admin123 for demo
            </Text>
            <TextInput
              style={[styles.input, { fontSize: textSizes.body }]}
              placeholder="Admin Email"
              value={adminEmail}
              onChangeText={setAdminEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { fontSize: textSizes.body }]}
              placeholder="Admin Password"
              value={adminPassword}
              onChangeText={setAdminPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleAdminLogin}>
              <Text style={[styles.primaryButtonText, { fontSize: textSizes.button }]}>Admin Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>System Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Users color={COLORS.primary} size={32} />
                <Text style={[styles.statNumber, { fontSize: textSizes.large }]}>
                  {systemStats?.totalUsers?.toLocaleString() || '0'}
                </Text>
                <Text style={[styles.statLabel, { fontSize: textSizes.body }]}>Total Users</Text>
              </View>
              <View style={styles.statCard}>
                <Shield color={COLORS.success} size={32} />
                <Text style={[styles.statNumber, { fontSize: textSizes.large }]}>
                  {systemStats?.activeDevices?.toLocaleString() || '0'}
                </Text>
                <Text style={[styles.statLabel, { fontSize: textSizes.body }]}>Active Devices</Text>
              </View>
              <View style={styles.statCard}>
                <Bell color={COLORS.warning} size={32} />
                <Text style={[styles.statNumber, { fontSize: textSizes.large }]}>
                  {systemStats?.supportTickets?.open || '0'}
                </Text>
                <Text style={[styles.statLabel, { fontSize: textSizes.body }]}>Open Tickets</Text>
              </View>
              <View style={styles.statCard}>
                <Heart color={COLORS.error} size={32} />
                <Text style={[styles.statNumber, { fontSize: textSizes.large }]}>
                  {systemStats?.premiumSubscriptions?.toLocaleString() || '0'}
                </Text>
                <Text style={[styles.statLabel, { fontSize: textSizes.body }]}>Premium Users</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>Admin Actions</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.adminAction}>
                <Users color={COLORS.primary} size={24} />
                <Text style={[styles.adminActionText, { fontSize: textSizes.body }]}>Manage Users</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adminAction}>
                <Bell color={COLORS.warning} size={24} />
                <Text style={[styles.adminActionText, { fontSize: textSizes.body }]}>Support Tickets</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adminAction}>
                <Settings color={COLORS.textSecondary} size={24} />
                <Text style={[styles.adminActionText, { fontSize: textSizes.body }]}>System Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>Account</Text>
        
        {isAuthenticated && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontSize: textSizes.subtitle }]}>Family Member</Text>
            <Text style={[styles.cardText, { fontSize: textSizes.body }]}>
              {session?.familyMember.name}
            </Text>
            <Text style={[styles.cardText, { fontSize: textSizes.body }]}>
              {session?.familyMember.email}
            </Text>
            <TouchableOpacity style={styles.dangerButton} onPress={dashboardLogout}>
              <LogOut size={20} color="white" />
              <Text style={[styles.dangerButtonText, { fontSize: textSizes.button }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isAdminAuthenticated && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontSize: textSizes.subtitle }]}>Admin Account</Text>
            <Text style={[styles.cardText, { fontSize: textSizes.body }]}>
              {adminSession?.user.name}
            </Text>
            <Text style={[styles.cardText, { fontSize: textSizes.body }]}>
              {adminSession?.user.email}
            </Text>
            <TouchableOpacity style={styles.dangerButton} onPress={adminLogout}>
              <LogOut size={20} color="white" />
              <Text style={[styles.dangerButtonText, { fontSize: textSizes.button }]}>Admin Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {isPaired && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontSize: textSizes.subtitle }]}>Device Management</Text>
            <TouchableOpacity 
              style={styles.dangerButton} 
              onPress={() => {
                Alert.alert(
                  'Unpair Device',
                  'Are you sure you want to unpair this device? This will remove all remote management capabilities.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Unpair', style: 'destructive', onPress: unpairDevice },
                  ]
                );
              }}
            >
              <Link size={20} color="white" />
              <Text style={[styles.dangerButtonText, { fontSize: textSizes.button }]}>Unpair Device</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>Quick Actions</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/guardian-status')}
          >
            <Battery color={COLORS.primary} size={24} />
            <Text style={[styles.quickActionText, { fontSize: textSizes.body }]}>Guardian Status</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/reminders')}
          >
            <Bell color={COLORS.warning} size={24} />
            <Text style={[styles.quickActionText, { fontSize: textSizes.body }]}>Reminders</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/contacts')}
          >
            <Phone color={COLORS.success} size={24} />
            <Text style={[styles.quickActionText, { fontSize: textSizes.body }]}>Emergency Contacts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: textSizes.title }]}>CareConnect Dashboard</Text>
      </View>

      <View style={styles.tabBar}>
        <TabButton tab="family" title="Family" icon={Users} />
        <TabButton tab="admin" title="Admin" icon={Shield} />
        <TabButton tab="settings" title="Settings" icon={Settings} />
      </View>

      {activeTab === 'family' && renderFamilyTab()}
      {activeTab === 'admin' && renderAdminTab()}
      {activeTab === 'settings' && renderSettingsTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabButtonText: {
    marginLeft: 8,
    color: COLORS.textSecondary,
  },
  activeTabButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  cardTitle: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardText: {
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    color: COLORS.textSecondary,
  },
  statusValue: {
    fontWeight: '500',
    color: COLORS.text,
  },
  statusOnline: {
    color: COLORS.success,
  },
  statusOffline: {
    color: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: COLORS.background,
    color: COLORS.text,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  addButton: {
    padding: 8,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  statNumber: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  adminAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  adminActionText: {
    marginLeft: 12,
    color: COLORS.text,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  quickActionText: {
    marginLeft: 12,
    color: COLORS.text,
  },
});