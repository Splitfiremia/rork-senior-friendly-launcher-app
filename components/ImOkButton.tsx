import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Heart, MessageCircle, AlertTriangle } from 'lucide-react-native';
import { useLauncher } from '@/hooks/launcher-context';
import { COLORS } from '@/constants/launcher-config';

interface ImOkButtonProps {
  size?: 'small' | 'large';
}

export default function ImOkButton({ size = 'large' }: ImOkButtonProps) {
  const { addWellnessCheckIn, getTodaysCheckIn } = useLauncher();
  const [showOptions, setShowOptions] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ok' | 'needs_help' | 'emergency'>('ok');

  // Debug state changes
  React.useEffect(() => {
    console.log('ImOkButton: showOptions state changed to:', showOptions);
  }, [showOptions]);

  React.useEffect(() => {
    console.log('ImOkButton: showMessageInput state changed to:', showMessageInput);
  }, [showMessageInput]);

  const todaysCheckIn = getTodaysCheckIn();
  const isSmall = size === 'small';

  const handleQuickCheckIn = async () => {
    console.log('ImOkButton: handleQuickCheckIn called');
    try {
      console.log('ImOkButton: Adding wellness check-in...');
      await addWellnessCheckIn({
        type: 'manual',
        status: 'ok',
      });
      console.log('ImOkButton: Wellness check-in added successfully');
      
      if (Platform.OS !== 'web') {
        // Show haptic feedback on mobile
        const Haptics = await import('expo-haptics');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        '✅ Check-in Recorded',
        'Your family has been notified that you&apos;re doing well!',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('ImOkButton: Error recording check-in:', error);
      Alert.alert('Error', 'Failed to record check-in. Please try again.');
    }
  };

  const handleDetailedCheckIn = async (status: 'ok' | 'needs_help' | 'emergency', customMessage?: string) => {
    console.log('ImOkButton: handleDetailedCheckIn called with status:', status, 'message:', customMessage);
    try {
      console.log('ImOkButton: Adding detailed wellness check-in...');
      await addWellnessCheckIn({
        type: 'manual',
        status,
        message: customMessage,
      });
      console.log('ImOkButton: Detailed wellness check-in added successfully');
      
      if (Platform.OS !== 'web') {
        const Haptics = await import('expo-haptics');
        if (status === 'emergency') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else if (status === 'needs_help') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
      
      const messages = {
        ok: '✅ Check-in Recorded\nYour family has been notified that you&apos;re doing well!',
        needs_help: '🤝 Help Request Sent\nYour family has been notified that you need assistance.',
        emergency: '🚨 Emergency Alert Sent\nYour family and emergency contacts have been notified immediately!',
      };
      
      Alert.alert(
        status === 'emergency' ? 'Emergency Alert' : 'Check-in Recorded',
        messages[status],
        [{ text: 'OK', style: status === 'emergency' ? 'destructive' : 'default' }]
      );
      
      setShowOptions(false);
      setShowMessageInput(false);
      setMessage('');
    } catch (error) {
      console.error('ImOkButton: Error recording detailed check-in:', error);
      Alert.alert('Error', 'Failed to record check-in. Please try again.');
    }
  };

  const handleStatusSelect = (status: 'ok' | 'needs_help' | 'emergency') => {
    setSelectedStatus(status);
    if (status === 'ok') {
      handleDetailedCheckIn(status);
    } else {
      setShowMessageInput(true);
    }
  };

  const handleMessageSubmit = () => {
    handleDetailedCheckIn(selectedStatus, message.trim() || undefined);
  };

  if (todaysCheckIn && isSmall) {
    return (
      <View style={[styles.container, styles.smallContainer]}>
        <View style={[styles.checkInStatus, styles.smallStatus]}>
          <Heart size={16} color={COLORS.success} fill={COLORS.success} />
          <Text style={[styles.statusText, styles.smallStatusText]}>Checked in today</Text>
        </View>
      </View>
    );
  }

  if (todaysCheckIn) {
    return (
      <View style={styles.container}>
        <View style={styles.checkInStatus}>
          <Heart size={32} color={COLORS.success} fill={COLORS.success} />
          <Text style={styles.statusText}>You&apos;ve checked in today!</Text>
          <Text style={styles.statusSubtext}>
            {new Date(todaysCheckIn.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => {
            console.log('ImOkButton: Update Status button pressed');
            setShowOptions(true);
          }}
          activeOpacity={0.8}
          testID="update-status-button"
        >
          <Text style={styles.updateButtonText}>Update Status</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isSmall && styles.smallContainer]}>
      <TouchableOpacity
        style={[styles.imOkButton, isSmall && styles.smallImOkButton]}
        onPress={handleQuickCheckIn}
        onLongPress={() => setShowOptions(true)}
        activeOpacity={0.8}
        testID="im-ok-button"
      >
        <Heart 
          size={isSmall ? 20 : 32} 
          color="#fff" 
          fill="#fff" 
        />
        <Text style={[styles.imOkText, isSmall && styles.smallImOkText]}>I&apos;m OK</Text>
        {!isSmall && (
          <Text style={styles.imOkSubtext}>Tap to check in • Hold for options</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => {
          console.log('ImOkButton: Options modal closed');
          setShowOptions(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How are you feeling?</Text>
            
            <TouchableOpacity
              style={[styles.optionButton, styles.okButton]}
              onPress={() => handleStatusSelect('ok')}
              activeOpacity={0.8}
            >
              <Heart size={24} color="#fff" fill="#fff" />
              <Text style={styles.optionText}>I&apos;m OK</Text>
              <Text style={styles.optionSubtext}>Everything is fine</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.optionButton, styles.helpButton]}
              onPress={() => handleStatusSelect('needs_help')}
              activeOpacity={0.8}
            >
              <MessageCircle size={24} color="#fff" />
              <Text style={styles.optionText}>Need Help</Text>
              <Text style={styles.optionSubtext}>Could use some assistance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.optionButton, styles.emergencyButton]}
              onPress={() => handleStatusSelect('emergency')}
              activeOpacity={0.8}
            >
              <AlertTriangle size={24} color="#fff" />
              <Text style={styles.optionText}>Emergency</Text>
              <Text style={styles.optionSubtext}>Need immediate help</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowOptions(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMessageInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMessageInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedStatus === 'needs_help' ? 'What do you need help with?' : 'Emergency Details'}
            </Text>
            
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Optional: Add a message..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowMessageInput(false);
                  setMessage('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  selectedStatus === 'emergency' && styles.emergencySubmitButton,
                ]}
                onPress={handleMessageSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitText}>
                  {selectedStatus === 'emergency' ? 'Send Emergency Alert' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  smallContainer: {
    marginHorizontal: 8,
    marginVertical: 4,
  },
  imOkButton: {
    backgroundColor: COLORS.success,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  smallImOkButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imOkText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  smallImOkText: {
    fontSize: 16,
    marginTop: 0,
    marginLeft: 8,
  },
  imOkSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  checkInStatus: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  smallStatus: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 0,
  },
  statusText: {
    color: COLORS.success,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  smallStatusText: {
    fontSize: 14,
    marginTop: 0,
    marginLeft: 8,
  },
  statusSubtext: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginTop: 6,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  optionButton: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  okButton: {
    backgroundColor: COLORS.success,
  },
  helpButton: {
    backgroundColor: '#FF9500',
  },
  emergencyButton: {
    backgroundColor: COLORS.error,
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  optionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  messageInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: COLORS.textSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  emergencySubmitButton: {
    backgroundColor: COLORS.error,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});