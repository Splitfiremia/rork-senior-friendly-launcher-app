import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Plus, Pill, Calendar, Clock, MoreVertical } from 'lucide-react-native';
import { useDashboard } from '@/hooks/dashboard-context';
import { Reminder } from '@/types/dashboard';
import { COLORS } from '@/constants/launcher-config';
import ReminderAlertComponent from '@/components/ReminderAlert';

export default function RemindersScreen() {
  const { 
    reminders, 
    activeAlerts, 
    addReminder, 
    updateReminder, 
    deleteReminder,
    acknowledgeAlert,
    snoozeAlert,
    dismissAlert,
    triggerReminderAlert,
    session 
  } = useDashboard();

  const [showTestButtons, setShowTestButtons] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      checkForDueReminders();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reminders]);

  const checkForDueReminders = () => {
    const now = new Date();
    reminders.forEach(reminder => {
      if (!reminder.isActive) return;
      
      const reminderTime = new Date(reminder.time);
      const timeDiff = now.getTime() - reminderTime.getTime();
      
      // Trigger if reminder is due (within 1 minute)
      if (timeDiff >= 0 && timeDiff < 60000) {
        triggerReminderAlert(reminder);
      }
    });
  };

  const handleAddTestReminder = async (type: 'medication' | 'appointment') => {
    const now = new Date();
    const testTime = new Date(now.getTime() + 5000); // 5 seconds from now
    
    const testReminder: Omit<Reminder, 'id' | 'createdAt'> = {
      type,
      title: type === 'medication' ? 'Take Heart Medication' : 'Doctor Appointment',
      description: type === 'medication' 
        ? 'Take 1 tablet with water. Important: Do not skip this dose!' 
        : 'Annual checkup with Dr. Smith at Main Street Clinic',
      time: testTime.toISOString(),
      isActive: true,
      createdBy: session?.familyMember.id || 'test-user',
    };

    await addReminder(testReminder);
    Alert.alert('Test Reminder Added', `${type} reminder will trigger in 5 seconds`);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString([], { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    return reminders
      .filter(reminder => reminder.isActive && new Date(reminder.time) > now)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .slice(0, 5);
  };

  const handleReminderPress = (reminder: Reminder) => {
    Alert.alert(
      reminder.title,
      `Scheduled for: ${formatTime(reminder.time)}\n\n${reminder.description || 'No additional details'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteReminder(reminder.id)
        },
        {
          text: reminder.isActive ? 'Disable' : 'Enable',
          onPress: () => updateReminder(reminder.id, { isActive: !reminder.isActive })
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Active Reminders</Text>
          {activeAlerts.map(alert => (
            <ReminderAlertComponent
              key={alert.id}
              alert={alert}
              onAcknowledge={() => acknowledgeAlert(alert.id)}
              onSnooze={(minutes) => snoozeAlert(alert.id, minutes)}
              onDismiss={() => dismissAlert(alert.id)}
            />
          ))}
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Reminders</Text>
            <Text style={styles.subtitle}>
              {reminders.filter(r => r.isActive).length} active reminders
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setShowTestButtons(!showTestButtons)}
            testID="reminder-settings-button"
          >
            <MoreVertical color={COLORS.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Test Buttons (for demo purposes) */}
        {showTestButtons && (
          <View style={styles.testSection}>
            <Text style={styles.testTitle}>Test Reminders (Demo)</Text>
            <View style={styles.testButtons}>
              <TouchableOpacity 
                style={[styles.testButton, { backgroundColor: COLORS.primary }]}
                onPress={() => handleAddTestReminder('medication')}
                testID="add-test-medication-button"
              >
                <Pill color={COLORS.white} size={20} />
                <Text style={styles.testButtonText}>Test Medication</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.testButton, { backgroundColor: COLORS.secondary }]}
                onPress={() => handleAddTestReminder('appointment')}
                testID="add-test-appointment-button"
              >
                <Calendar color={COLORS.white} size={20} />
                <Text style={styles.testButtonText}>Test Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Upcoming Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {getUpcomingReminders().length === 0 ? (
            <View style={styles.emptyState}>
              <Clock color={COLORS.textSecondary} size={48} />
              <Text style={styles.emptyStateTitle}>No upcoming reminders</Text>
              <Text style={styles.emptyStateText}>
                Family members can add medication and appointment reminders remotely
              </Text>
            </View>
          ) : (
            getUpcomingReminders().map(reminder => (
              <TouchableOpacity
                key={reminder.id}
                style={styles.reminderCard}
                onPress={() => handleReminderPress(reminder)}
                testID={`reminder-${reminder.id}`}
              >
                <View style={[
                  styles.reminderIcon, 
                  { backgroundColor: reminder.type === 'medication' ? COLORS.primary : COLORS.secondary }
                ]}>
                  {reminder.type === 'medication' ? (
                    <Pill color={COLORS.white} size={24} />
                  ) : (
                    <Calendar color={COLORS.white} size={24} />
                  )}
                </View>
                
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderTime}>{formatTime(reminder.time)}</Text>
                  {reminder.description && (
                    <Text style={styles.reminderDescription} numberOfLines={2}>
                      {reminder.description}
                    </Text>
                  )}
                </View>
                
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: reminder.isActive ? COLORS.success : COLORS.textSecondary }
                ]} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* All Reminders */}
        {reminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Reminders ({reminders.length})</Text>
            {reminders.map(reminder => (
              <TouchableOpacity
                key={reminder.id}
                style={[styles.reminderCard, !reminder.isActive && styles.inactiveCard]}
                onPress={() => handleReminderPress(reminder)}
                testID={`all-reminder-${reminder.id}`}
              >
                <View style={[
                  styles.reminderIcon, 
                  { 
                    backgroundColor: reminder.type === 'medication' ? COLORS.primary : COLORS.secondary,
                    opacity: reminder.isActive ? 1 : 0.5
                  }
                ]}>
                  {reminder.type === 'medication' ? (
                    <Pill color={COLORS.white} size={24} />
                  ) : (
                    <Calendar color={COLORS.white} size={24} />
                  )}
                </View>
                
                <View style={styles.reminderContent}>
                  <Text style={[styles.reminderTitle, !reminder.isActive && styles.inactiveText]}>
                    {reminder.title}
                  </Text>
                  <Text style={[styles.reminderTime, !reminder.isActive && styles.inactiveText]}>
                    {formatTime(reminder.time)}
                  </Text>
                  {reminder.description && (
                    <Text style={[styles.reminderDescription, !reminder.isActive && styles.inactiveText]} numberOfLines={2}>
                      {reminder.description}
                    </Text>
                  )}
                </View>
                
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: reminder.isActive ? COLORS.success : COLORS.textSecondary }
                ]} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  alertsSection: {
    backgroundColor: COLORS.white,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  testSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  testButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  testButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.7,
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  inactiveText: {
    opacity: 0.6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  bottomPadding: {
    height: 100,
  },
});