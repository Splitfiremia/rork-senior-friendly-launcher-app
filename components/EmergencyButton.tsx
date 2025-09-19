import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Linking, Platform, View, Animated } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useEmergencyContact, useLauncher } from '@/hooks/launcher-context';
import { useDashboard } from '@/hooks/dashboard-context';
import { TEXT_SIZES, COLORS } from '@/constants/launcher-config';

export default function EmergencyButton() {
  const { settings } = useLauncher();
  const emergencyContact = useEmergencyContact();
  const { deviceInfo } = useDashboard();
  const textSizes = TEXT_SIZES[settings.textSize];
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));

  React.useEffect(() => {
    // Pulse animation for emergency button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const sendEmergencyAlert = async () => {
    if (deviceInfo?.familyMembers?.length) {
      try {
        // Log emergency activation for family members
        console.log(`EMERGENCY: Emergency button activated by ${emergencyContact?.name || 'user'}. Immediate assistance may be needed.`);
        console.log('Emergency alert would be sent to family members:', deviceInfo.familyMembers);
      } catch (error) {
        console.error('Failed to send emergency alert:', error);
      }
    }
  };

  const makeEmergencyCall = async () => {
    if (!emergencyContact) {
      // Call 911 if no emergency contact is set
      if (Platform.OS !== 'web') {
        try {
          await Linking.openURL('tel:911');
        } catch (error) {
          Alert.alert('Error', 'Unable to make emergency call');
        }
      } else {
        Alert.alert('Emergency', 'Would call 911 (emergency services)');
      }
      return;
    }

    if (Platform.OS !== 'web') {
      try {
        await Linking.openURL(`tel:${emergencyContact.phone}`);
      } catch {
        Alert.alert('Error', 'Unable to make emergency call');
      }
    } else {
      Alert.alert('Emergency Call', `Would call ${emergencyContact.name} at ${emergencyContact.phone}`);
    }
  };

  const sendEmergencyMessage = async () => {
    if (!emergencyContact) return;
    
    const message = 'EMERGENCY: I need help. This is an automated emergency message from my phone.';
    
    if (Platform.OS !== 'web') {
      try {
        await Linking.openURL(`sms:${emergencyContact.phone}?body=${encodeURIComponent(message)}`);
      } catch {
        Alert.alert('Error', 'Unable to send emergency message');
      }
    } else {
      Alert.alert('Emergency Message', `Would send emergency message to ${emergencyContact.name}`);
    }
  };

  const handleEmergencyPress = () => {
    if (!emergencyContact) {
      Alert.alert(
        'Emergency Services',
        'No emergency contact set. Call 911?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call 911',
            style: 'destructive',
            onPress: makeEmergencyCall,
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Emergency Response',
      `Emergency contact: ${emergencyContact.name}\\nChoose your emergency action:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Message',
          onPress: () => {
            sendEmergencyAlert();
            sendEmergencyMessage();
          },
        },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => {
            sendEmergencyAlert();
            makeEmergencyCall();
          },
        },
      ]
    );
  };

  const handleLongPress = () => {
    setIsPressed(true);
    setCountdown(3);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPressed(false);
          // Auto-call emergency after 3 seconds
          sendEmergencyAlert();
          makeEmergencyCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Clear timer if user releases before countdown
    setTimeout(() => {
      if (isPressed) {
        clearInterval(timer);
        setIsPressed(false);
        setCountdown(0);
      }
    }, 3000);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    setCountdown(0);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.button,
            isPressed && styles.buttonPressed,
          ]}
          onPress={handleEmergencyPress}
          onLongPress={handleLongPress}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          testID="emergency-button"
        >
          <AlertTriangle color="white" size={36} strokeWidth={4} />
          <Text style={[styles.text, { fontSize: textSizes.button }]}>
            {isPressed ? `CALLING IN ${countdown}` : 'EMERGENCY'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      {emergencyContact && (
        <View style={styles.contactInfo}>
          <Text style={[styles.contactText, { fontSize: textSizes.body }]}>
            Emergency Contact: {emergencyContact.name}
          </Text>
          <Text style={[styles.instructionText, { fontSize: textSizes.body - 2 }]}>
            Tap for options • Hold for 3 seconds to auto-call
          </Text>
        </View>
      )}
      
      {!emergencyContact && (
        <View style={styles.contactInfo}>
          <Text style={[styles.warningText, { fontSize: textSizes.body }]}>
            ⚠️ No emergency contact set
          </Text>
          <Text style={[styles.instructionText, { fontSize: textSizes.body - 2 }]}>
            Will call 911 • Set contact in Settings
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonWrapper: {
    shadowColor: COLORS.emergency,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  button: {
    backgroundColor: COLORS.emergency,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginHorizontal: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    minWidth: 280,
  },
  buttonPressed: {
    backgroundColor: '#CC0000',
    transform: [{ scale: 0.95 }],
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 12,
    letterSpacing: 1.5,
    fontSize: 22,
    textAlign: 'center',
  },
  contactInfo: {
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  contactText: {
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  warningText: {
    color: COLORS.warning,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  instructionText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});