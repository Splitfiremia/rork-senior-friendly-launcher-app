import { useEffect, useRef, useCallback } from 'react';
import { useDashboard } from './dashboard-context';
import { Reminder } from '@/types/dashboard';

export function useReminderScheduler() {
  const { reminders, triggerReminderAlert } = useDashboard();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triggeredReminders = useRef<Set<string>>(new Set());

  const checkForDueReminders = useCallback(() => {
    const now = new Date();
    
    reminders.forEach(reminder => {
      if (!reminder.isActive) return;
      
      const reminderTime = new Date(reminder.time);
      const timeDiff = now.getTime() - reminderTime.getTime();
      
      // Trigger if reminder is due (within 2 minutes) and hasn't been triggered yet
      if (timeDiff >= 0 && timeDiff < 120000) { // 2 minutes window
        const reminderKey = `${reminder.id}-${reminderTime.getTime()}`;
        
        if (!triggeredReminders.current.has(reminderKey)) {
          console.log('Triggering reminder:', reminder.title, 'at', now.toISOString());
          triggerReminderAlert(reminder);
          triggeredReminders.current.add(reminderKey);
          
          // Clean up old triggered reminders (older than 1 hour)
          const oneHourAgo = now.getTime() - 3600000;
          triggeredReminders.current.forEach(key => {
            const timestamp = parseInt(key.split('-').pop() || '0');
            if (timestamp < oneHourAgo) {
              triggeredReminders.current.delete(key);
            }
          });
        }
      }
    });
  }, [reminders, triggerReminderAlert]);

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start checking for due reminders every 30 seconds
    intervalRef.current = setInterval(() => {
      checkForDueReminders();
    }, 30000);

    // Initial check
    checkForDueReminders();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkForDueReminders]);

  const scheduleRecurringReminders = useCallback((reminder: Reminder) => {
    if (!reminder.recurring) return;

    const now = new Date();
    const reminderTime = new Date(reminder.time);
    
    // If this is a recurring reminder and it's past due, schedule the next occurrence
    if (reminderTime < now) {
      let nextTime = new Date(reminderTime);
      
      switch (reminder.recurring.frequency) {
        case 'daily':
          nextTime.setDate(nextTime.getDate() + 1);
          break;
        case 'weekly':
          nextTime.setDate(nextTime.getDate() + 7);
          break;
        case 'monthly':
          nextTime.setMonth(nextTime.getMonth() + 1);
          break;
      }
      
      // Check if we haven't exceeded the end date
      if (!reminder.recurring.endDate || nextTime <= new Date(reminder.recurring.endDate)) {
        // This would typically update the reminder in the database
        console.log('Scheduling next occurrence of recurring reminder:', reminder.title, 'for', nextTime.toISOString());
      }
    }
  }, []);

  return {
    checkForDueReminders,
    scheduleRecurringReminders,
  };
}