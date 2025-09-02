import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Clock, Pill, Calendar, X, Timer } from 'lucide-react-native';
import { ReminderAlert } from '@/types/dashboard';
import { COLORS } from '@/constants/launcher-config';

interface ReminderAlertProps {
  alert: ReminderAlert;
  onAcknowledge: () => void;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
}

export default function ReminderAlertComponent({ alert, onAcknowledge, onSnooze, onDismiss }: ReminderAlertProps) {
  const { reminder } = alert;
  const isOverdue = new Date(reminder.time) < new Date();
  
  const getIcon = () => {
    switch (reminder.type) {
      case 'medication':
        return <Pill color={COLORS.white} size={32} />;
      case 'appointment':
        return <Calendar color={COLORS.white} size={32} />;
      default:
        return <Bell color={COLORS.white} size={32} />;
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isOverdue && styles.overdueContainer]}>
      <TouchableOpacity 
        style={styles.dismissButton}
        onPress={onDismiss}
        testID="reminder-dismiss-button"
      >
        <X color={COLORS.textSecondary} size={20} />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: reminder.type === 'medication' ? COLORS.primary : COLORS.secondary }]}>
          {getIcon()}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{reminder.title}</Text>
          <View style={styles.timeContainer}>
            <Clock color={COLORS.textSecondary} size={16} />
            <Text style={styles.time}>{formatTime(reminder.time)}</Text>
            {isOverdue && <Text style={styles.overdueText}>OVERDUE</Text>}
          </View>
        </View>
      </View>

      {reminder.description && (
        <Text style={styles.description}>{reminder.description}</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acknowledgeButton]}
          onPress={onAcknowledge}
          testID="reminder-acknowledge-button"
        >
          <Text style={styles.acknowledgeButtonText}>Got It!</Text>
        </TouchableOpacity>
        
        <View style={styles.snoozeContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.snoozeButton]}
            onPress={() => onSnooze(15)}
            testID="reminder-snooze-15-button"
          >
            <Timer color={COLORS.textSecondary} size={16} />
            <Text style={styles.snoozeButtonText}>15m</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.snoozeButton]}
            onPress={() => onSnooze(60)}
            testID="reminder-snooze-60-button"
          >
            <Timer color={COLORS.textSecondary} size={16} />
            <Text style={styles.snoozeButtonText}>1h</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  overdueContainer: {
    borderLeftColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  dismissButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingRight: 40,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  overdueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4444',
    marginLeft: 8,
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acknowledgeButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
    marginRight: 12,
  },
  acknowledgeButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  snoozeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  snoozeButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  snoozeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});