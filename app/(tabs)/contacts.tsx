import React, { useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Plus, Search, Star, AlertCircle } from 'lucide-react-native';
import { useLauncher } from '@/hooks/launcher-context';
import ContactCard from '@/components/ContactCard';
import { COLORS, TEXT_SIZES } from '@/constants/launcher-config';
import { Contact } from '@/types/launcher';

export default function ContactsScreen() {
  const { contacts, settings, addContact, deleteContact, toggleFavoriteContact, setEmergencyContact } = useLauncher();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const textSizes = TEXT_SIZES[settings.textSize];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      isFavorite: false,
      isEmergency: false,
    };

    addContact(contact);
    setNewContact({ name: '', phone: '' });
    setShowAddForm(false);
  };

  const handleContactPress = (contact: Contact) => {
    Alert.alert(
      contact.name,
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: contact.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
          onPress: () => toggleFavoriteContact(contact.id),
        },
        {
          text: 'Set as Emergency Contact',
          onPress: () => setEmergencyContact(contact.id),
          style: contact.isEmergency ? 'destructive' : 'default',
        },
        {
          text: 'Delete Contact',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Contact',
              `Are you sure you want to delete ${contact.name}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteContact(contact.id) },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: textSizes.large }]}>Contacts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
          testID="add-contact-button"
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color={COLORS.textSecondary} size={24} />
        <TextInput
          style={[styles.searchInput, { fontSize: textSizes.body }]}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {showAddForm && (
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, { fontSize: textSizes.body }]}
            placeholder="Name"
            value={newContact.name}
            onChangeText={(text) => setNewContact({ ...newContact, name: text })}
            placeholderTextColor={COLORS.textSecondary}
          />
          <TextInput
            style={[styles.input, { fontSize: textSizes.body }]}
            placeholder="Phone Number"
            value={newContact.phone}
            onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.textSecondary}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setShowAddForm(false);
                setNewContact({ name: '', phone: '' });
              }}
            >
              <Text style={[styles.buttonText, { fontSize: textSizes.button }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.saveButton]}
              onPress={handleAddContact}
            >
              <Text style={[styles.buttonText, { fontSize: textSizes.button, color: 'white' }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { fontSize: textSizes.subtitle }]}>
              {searchQuery ? 'No contacts found' : 'No contacts yet'}
            </Text>
          </View>
        ) : (
          filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onPress={() => handleContactPress(contact)}
            />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
  addForm: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    color: COLORS.text,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  buttonText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
  },
});