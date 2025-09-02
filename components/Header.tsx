import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Battery, Wifi, WifiOff } from 'lucide-react-native';
import { useLauncher } from '@/hooks/launcher-context';
import { TEXT_SIZES, COLORS } from '@/constants/launcher-config';

export default function Header() {
  const { settings } = useLauncher();
  const textSizes = TEXT_SIZES[settings.textSize];
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel] = useState(75); // Mock battery level

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.header}>
      <View style={styles.timeContainer}>
        <Text style={[styles.time, { fontSize: textSizes.large * 1.5 }]}>
          {formatTime(currentTime)}
        </Text>
        <Text style={[styles.date, { fontSize: textSizes.subtitle }]}>
          {formatDate(currentTime)}
        </Text>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Wifi color={COLORS.textSecondary} size={24} />
        </View>
        <View style={styles.statusItem}>
          <Battery color={COLORS.textSecondary} size={24} />
          <Text style={[styles.batteryText, { fontSize: textSizes.body }]}>
            {batteryLevel}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  timeContainer: {
    flex: 1,
  },
  time: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  date: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  batteryText: {
    marginLeft: 6,
    color: COLORS.textSecondary,
  },
});