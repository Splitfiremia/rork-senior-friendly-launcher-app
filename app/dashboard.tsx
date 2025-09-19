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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useDashboard } from '@/hooks/dashboard-context';
import QRCode from 'react-native-qrcode-svg';
import { Shield, Users, Smartphone, Link, LogOut, RefreshCw } from 'lucide-react-native';

export default function DashboardScreen() {
  const {
    deviceId,
    deviceInfo,
    session,
    isAuthenticated,
    isPaired,
    generatePairingCode,
    pairDevice,
    authenticateFamilyMember,
    logout,
    unpairDevice,
  } = useDashboard();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      await authenticateFamilyMember({ email, password });
      Alert.alert('Success', 'Logged in successfully');
    } catch {
      Alert.alert('Error', 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePairDevice = async () => {
    setIsLoading(true);
    try {
      await pairDevice('mock-token');
      Alert.alert('Success', 'Device paired successfully');
      setShowQR(false);
    } catch {
      Alert.alert('Error', 'Failed to pair device');
    } finally {
      setIsLoading(false);
    }
  };

  const pairingCode = generatePairingCode();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Family Dashboard',
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Device Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Smartphone size={24} color="#4A90E2" />
            <Text style={styles.statusTitle}>Device Status</Text>
          </View>
          
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Device ID:</Text>
            <Text style={styles.statusValue}>{deviceId || 'Not initialized'}</Text>
          </View>
          
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Pairing Status:</Text>
            <Text style={[styles.statusValue, isPaired ? styles.statusOnline : styles.statusOffline]}>
              {isPaired ? 'Paired' : 'Not Paired'}
            </Text>
          </View>
          
          {deviceInfo && (
            <>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Device Name:</Text>
                <Text style={styles.statusValue}>{deviceInfo.name}</Text>
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Last Sync:</Text>
                <Text style={styles.statusValue}>
                  {new Date(deviceInfo.lastSync).toLocaleString()}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Authentication Section */}
        {!isAuthenticated ? (
          <View style={styles.authCard}>
            <View style={styles.authHeader}>
              <Shield size={24} color="#4A90E2" />
              <Text style={styles.authTitle}>Family Member Login</Text>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="email-input"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              testID="password-input"
            />
            
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              testID="login-button"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.authCard}>
            <View style={styles.authHeader}>
              <Users size={24} color="#4A90E2" />
              <Text style={styles.authTitle}>Logged In</Text>
            </View>
            
            <Text style={styles.userInfo}>
              {session?.familyMember.name} ({session?.familyMember.email})
            </Text>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={logout}
              testID="logout-button"
            >
              <LogOut size={20} color="#FF6B6B" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pairing Section */}
        {!isPaired && (
          <View style={styles.pairingCard}>
            <View style={styles.pairingHeader}>
              <Link size={24} color="#4A90E2" />
              <Text style={styles.pairingTitle}>Device Pairing</Text>
            </View>
            
            {showQR && pairingCode ? (
              <View style={styles.qrContainer}>
                <Text style={styles.qrInstructions}>
                  Scan this QR code from the family dashboard web app
                </Text>
                <View style={styles.qrCodeWrapper}>
                  {Platform.OS === 'web' ? (
                    <View style={styles.qrPlaceholder}>
                      <Text style={styles.qrPlaceholderText}>QR Code</Text>
                      <Text style={styles.qrData}>{pairingCode.substring(0, 20)}...</Text>
                    </View>
                  ) : (
                    <QRCode
                      value={pairingCode}
                      size={200}
                      backgroundColor="white"
                      color="black"
                    />
                  )}
                </View>
                <TouchableOpacity
                  style={styles.pairButton}
                  onPress={handlePairDevice}
                  disabled={isLoading}
                  testID="pair-button"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Link size={20} color="#FFFFFF" />
                      <Text style={styles.pairButtonText}>Simulate Pairing</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.showQRButton}
                onPress={() => setShowQR(true)}
                testID="show-qr-button"
              >
                <Text style={styles.showQRButtonText}>Show QR Code for Pairing</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Unpair Device */}
        {isPaired && (
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <TouchableOpacity
              style={styles.unpairButton}
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
              testID="unpair-button"
            >
              <RefreshCw size={20} color="#FF6B6B" />
              <Text style={styles.unpairButtonText}>Unpair Device</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#4A90E2',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#2C3E50',
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  statusOnline: {
    color: '#27AE60',
  },
  statusOffline: {
    color: '#E74C3C',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#2C3E50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
    padding: 12,
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginLeft: 8,
  },
  pairingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pairingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pairingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#2C3E50',
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrInstructions: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  qrPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 10,
  },
  qrData: {
    fontSize: 10,
    color: '#BDC3C7',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  showQRButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  showQRButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pairButton: {
    flexDirection: 'row',
    backgroundColor: '#27AE60',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dangerZone: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 15,
  },
  unpairButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
    padding: 12,
  },
  unpairButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginLeft: 8,
  },
});