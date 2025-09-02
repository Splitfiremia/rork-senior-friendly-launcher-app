import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, Search, X, User, Star } from 'lucide-react-native';
import { useLauncher } from '@/hooks/launcher-context';
import { COLORS, TEXT_SIZES } from '@/constants/launcher-config';
import { Contact } from '@/types/launcher';



export default function PhoneDialerScreen() {
  const router = useRouter();
  const { contacts, settings } = useLauncher();
  const [searchQuery, setSearchQuery] = useState('');
  const textSizes = TEXT_SIZES[settings.textSize];

  const filteredContacts = useMemo(() => {
    if (!searchQuery) {
      return contacts.sort((a, b) => {
        if (a.isEmergency && !b.isEmergency) return -1;
        if (!a.isEmergency && b.isEmergency) return 1;
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });
    }
    
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
    );
  }, [contacts, searchQuery]);

  const makeCall = (contact: Contact) => {
    if (Platform.OS !== 'web') {
      Linking.openURL(`tel:${contact.phone}`);
    } else {
      Alert.alert(
        'Calling',
        `Would call ${contact.name} at ${contact.phone}`,
        [{ text: 'OK' }]
      );
    }
  };

  const getContactInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getContactColor = (contact: Contact) => {
    if (contact.isEmergency) return COLORS.emergency;
    if (contact.isFavorite) return COLORS.primary;
    return COLORS.textSecondary;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          testID="close-button"
        >
          <X color={COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: textSizes.title }]}>
          Select Contact to Call
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Search color={COLORS.textSecondary} size={24} />
        <TextInput
          style={[styles.searchInput, { fontSize: textSizes.body }]}
          placeholder="Search contacts..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="search-input"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <X color={COLORS.textSecondary} size={20} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.contactsList}
        contentContainerStyle={styles.contactsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <User color={COLORS.textSecondary} size={48} />
            <Text style={[styles.emptyText, { fontSize: textSizes.body }]}>
              No contacts found
            </Text>
          </View>
        ) : (
          filteredContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              onPress={() => makeCall(contact)}
              activeOpacity={0.7}
              testID={`contact-${contact.id}`}
            >
              <View style={styles.contactContent}>
                <View
                  style={[
                    styles.avatar,
                    !contact.photo && { backgroundColor: getContactColor(contact) + '20' },
                  ]}
                >
                  {contact.photo ? (
                    <Image
                      source={{ uri: contact.photo }}
                      style={styles.avatarImage}
                      testID={`contact-photo-${contact.id}`}
                    />
                  ) : (
                    <Text style={[styles.avatarText, { color: getContactColor(contact) }]}>
                      {getContactInitials(contact.name)}
                    </Text>
                  )}
                </View>
                
                <View style={styles.contactInfo}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[
                        styles.contactName,
                        { fontSize: textSizes.subtitle },
                        contact.isEmergency && styles.emergencyText,
                      ]}
                      numberOfLines={1}
                    >
                      {contact.name}
                    </Text>
                    {contact.isFavorite && (
                      <Star
                        color={COLORS.warning}
                        size={20}
                        fill={COLORS.warning}
                        style={styles.favoriteIcon}
                      />
                    )}
                  </View>
                  <Text
                    style={[styles.contactPhone, { fontSize: textSizes.body }]}
                    numberOfLines={1}
                  >
                    {contact.phone}
                  </Text>
                  {contact.isEmergency && (
                    <Text style={[styles.emergencyLabel, { fontSize: textSizes.body - 2 }]}>
                      EMERGENCY CONTACT
                    </Text>
                  )}
                </View>

                <View style={styles.callButtonContainer}>
                  <View
                    style={[
                      styles.callButton,
                      { backgroundColor: getContactColor(contact) },
                    ]}
                  >
                    <Phone color="white" size={28} fill="white" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontWeight: '600',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: COLORS.text,
  },
  clearButton: {
    padding: 4,
  },
  contactsList: {
    flex: 1,
  },
  contactsContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  contactCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 60,
    height: 60,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  favoriteIcon: {
    marginLeft: 8,
  },
  contactPhone: {
    color: COLORS.textSecondary,
  },
  emergencyText: {
    color: COLORS.emergency,
  },
  emergencyLabel: {
    color: COLORS.emergency,
    fontWeight: '600',
    marginTop: 4,
  },
  callButtonContainer: {
    marginLeft: 12,
  },
  callButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});