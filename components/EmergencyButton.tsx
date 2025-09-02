import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useEmergencyContact, useLauncher } from '@/hooks/launcher-context';
import { TEXT_SIZES, COLORS } from '@/constants/launcher-config';

export default function EmergencyButton() {
  const { settings } = useLauncher();
  const emergencyContact = useEmergencyContact();
  const textSizes = TEXT_SIZES[settings.textSize];

  const handleEmergency = () => {
    if (!emergencyContact) {
      Alert.alert(
        'No Emergency Contact',
        'Please set an emergency contact in settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Emergency Call',
      `Call ${emergencyContact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Linking.openURL(`tel:${emergencyContact.phone}`);
            } else {
              Alert.alert('Emergency', `Would call ${emergencyContact.name} at ${emergencyContact.phone}`);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleEmergency}
      activeOpacity={0.8}
      testID="emergency-button"
    >
      <AlertTriangle color="white" size={36} strokeWidth={4} />
      <Text style={[styles.text, { fontSize: textSizes.button }]}>
        EMERGENCY
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.emergency,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: COLORS.emergency,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 12,
    letterSpacing: 1.5,
    fontSize: 22,
  },
});