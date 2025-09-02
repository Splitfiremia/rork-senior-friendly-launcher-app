import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Battery, Wifi, WifiOff, AlertTriangle } from 'lucide-react-native';
import { useBatteryConnectivityGuardian } from '@/hooks/battery-connectivity-guardian';

interface GuardianStatusProps {
  showDetails?: boolean;
}

export function GuardianStatus({ showDetails = false }: GuardianStatusProps) {
  const { batteryStatus, connectivityStatus, isGuardianActive } = useBatteryConnectivityGuardian();

  if (!isGuardianActive && !showDetails) {
    return null;
  }

  const batteryPercentage = Math.round(batteryStatus.level * 100);
  const isBatteryLow = batteryPercentage <= 20;
  const isBatteryCritical = batteryPercentage <= 5;
  const isConnected = connectivityStatus.isConnected && connectivityStatus.isInternetReachable !== false;

  const getBatteryColor = () => {
    if (isBatteryCritical) return '#ef4444'; // red-500
    if (isBatteryLow) return '#f59e0b'; // amber-500
    return '#10b981'; // emerald-500
  };

  const getConnectivityColor = () => {
    return isConnected ? '#10b981' : '#ef4444'; // emerald-500 : red-500
  };

  if (!showDetails) {
    // Compact status bar version
    return (
      <View style={styles.compactContainer}>
        <View style={styles.statusItem}>
          <Battery 
            size={16} 
            color={getBatteryColor()} 
            fill={batteryStatus.isCharging ? getBatteryColor() : 'transparent'}
          />
          <Text style={[styles.compactText, { color: getBatteryColor() }]}>
            {batteryPercentage}%
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          {isConnected ? (
            <Wifi size={16} color={getConnectivityColor()} />
          ) : (
            <WifiOff size={16} color={getConnectivityColor()} />
          )}
        </View>
        
        {(isBatteryLow || !isConnected) && (
          <AlertTriangle size={16} color="#f59e0b" />
        )}
      </View>
    );
  }

  // Detailed status version
  return (
    <View style={styles.detailedContainer}>
      <Text style={styles.title}>Guardian Status</Text>
      
      <View style={styles.statusRow}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Battery 
              size={24} 
              color={getBatteryColor()} 
              fill={batteryStatus.isCharging ? getBatteryColor() : 'transparent'}
            />
            <Text style={styles.statusLabel}>Battery</Text>
          </View>
          <Text style={[styles.statusValue, { color: getBatteryColor() }]}>
            {batteryPercentage}%
          </Text>
          <Text style={styles.statusSubtext}>
            {batteryStatus.isCharging ? 'Charging' : 'Not charging'}
          </Text>
          {batteryStatus.lowBatteryMode && (
            <Text style={styles.lowPowerText}>Low Power Mode</Text>
          )}
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {isConnected ? (
              <Wifi size={24} color={getConnectivityColor()} />
            ) : (
              <WifiOff size={24} color={getConnectivityColor()} />
            )}
            <Text style={styles.statusLabel}>Connection</Text>
          </View>
          <Text style={[styles.statusValue, { color: getConnectivityColor() }]}>
            {isConnected ? 'Online' : 'Offline'}
          </Text>
          <Text style={styles.statusSubtext}>
            {connectivityStatus.type || 'Unknown'}
          </Text>
        </View>
      </View>

      {isGuardianActive && (
        <View style={styles.guardianInfo}>
          <Text style={styles.guardianText}>
            🛡️ Guardian monitoring active - Family will be notified of any issues
          </Text>
        </View>
      )}

      {(isBatteryLow || !isConnected) && (
        <View style={styles.alertContainer}>
          <AlertTriangle size={20} color="#f59e0b" />
          <Text style={styles.alertText}>
            {isBatteryCritical 
              ? 'Critical battery level - charge immediately!'
              : isBatteryLow 
                ? 'Low battery - please charge soon'
                : 'No internet connection - check Wi-Fi or mobile data'
            }
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailedContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  lowPowerText: {
    fontSize: 10,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 4,
  },
  guardianInfo: {
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  guardianText: {
    fontSize: 14,
    color: '#065f46',
    textAlign: 'center',
    fontWeight: '500',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
});