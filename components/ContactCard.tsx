import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert, Linking, Platform } from 'react-native';
import { Phone, Star, AlertCircle } from 'lucide-react-native';
import { Contact } from '@/types/launcher';
import { useLauncher } from '@/hooks/launcher-context';
import { TEXT_SIZES, COLORS } from '@/constants/launcher-config';

interface ContactCardProps {
  contact: Contact;
  onPress?: () => void;
  showActions?: boolean;
}

export default function ContactCard({ contact, onPress, showActions = true }: ContactCardProps) {
  const { settings, toggleFavoriteContact } = useLauncher();
  const textSizes = TEXT_SIZES[settings.textSize];

  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Linking.openURL(`tel:${contact.phone}`);
    } else {
      Alert.alert('Call', `Would call ${contact.name} at ${contact.phone}`);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      handleCall();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        contact.isEmergency && styles.emergencyCard,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      testID={`contact-card-${contact.id}`}
    >
      <View style={styles.leftContent}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarText, { fontSize: textSizes.large }]}>
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { fontSize: textSizes.subtitle }]} numberOfLines={1}>
            {contact.name}
          </Text>
          <Text style={[styles.phone, { fontSize: textSizes.body }]}>
            {contact.phone}
          </Text>
        </View>
      </View>
      
      {showActions && (
        <View style={styles.actions}>
          {contact.isEmergency && (
            <AlertCircle
              color={COLORS.emergency}
              size={24}
              style={styles.icon}
            />
          )}
          {contact.isFavorite && (
            <Star
              color={COLORS.warning}
              fill={COLORS.warning}
              size={24}
              style={styles.icon}
            />
          )}
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCall}
            testID={`call-button-${contact.id}`}
          >
            <Phone color="white" size={24} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emergencyCard: {
    borderWidth: 2,
    borderColor: COLORS.emergency,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  phone: {
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  callButton: {
    backgroundColor: COLORS.success,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});