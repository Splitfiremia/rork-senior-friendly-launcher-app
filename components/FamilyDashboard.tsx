import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDashboard } from '@/hooks/dashboard-context';
import { useLauncher } from '@/hooks/launcher-context';
import { Contact } from '@/types/launcher';
import { RemoteCommand } from '@/types/dashboard';
import { Plus, Edit2, Trash2, Phone, Star, AlertCircle, Battery, Wifi, WifiOff } from 'lucide-react-native';

export default function FamilyDashboard() {
  const { session, addRemoteCommand, processRemoteCommand, pendingCommands } = useDashboard();
  const { contacts, addContact, updateContact, deleteContact, wellnessAlerts } = useLauncher();
  
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    photo: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Cross-platform UUID generator
  const generateUUID = (): string => {
    // Use crypto.randomUUID if available (web and modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback UUID generation for all platforms
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Please enter name and phone number');
      return;
    }

    const contact: Contact = {
      id: generateUUID(),
      name: newContact.name,
      phone: newContact.phone,
      photo: newContact.photo || undefined,
      isFavorite: false,
      isEmergency: false,
    };

    // Add locally
    await addContact(contact);
    
    // Create remote command for syncing
    await addRemoteCommand({
      type: 'add_contact',
      payload: contact,
      createdBy: session?.familyMember.id || 'unknown',
    });

    setNewContact({ name: '', phone: '', photo: '' });
    setShowAddContact(false);
    Alert.alert('Success', 'Contact added successfully');
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;

    await updateContact(editingContact.id, editingContact);
    
    // Create remote command for syncing
    await addRemoteCommand({
      type: 'update_contact',
      payload: editingContact,
      createdBy: session?.familyMember.id || 'unknown',
    });

    setEditingContact(null);
    Alert.alert('Success', 'Contact updated successfully');
  };

  const handleDeleteContact = async (contactId: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteContact(contactId);
            
            // Create remote command for syncing
            await addRemoteCommand({
              type: 'delete_contact',
              payload: { contactId },
              createdBy: session?.familyMember.id || 'unknown',
            });
            
            Alert.alert('Success', 'Contact deleted successfully');
          },
        },
      ]
    );
  };

  const processPendingCommands = async () => {
    setIsProcessing(true);
    
    for (const command of pendingCommands.filter((c: RemoteCommand) => c.status === 'pending')) {
      await processRemoteCommand(command);
    }
    
    setIsProcessing(false);
    Alert.alert('Success', 'Commands processed successfully');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Monitor and manage the senior&apos;s device
        </Text>
      </View>

      {/* Guardian Alerts */}
      {wellnessAlerts.filter(alert => 
        ['low_battery', 'battery_critical', 'connectivity_lost', 'connectivity_restored'].includes(alert.type) &&
        !alert.acknowledged
      ).length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>🛡️ Guardian Alerts</Text>
          {wellnessAlerts
            .filter(alert => 
              ['low_battery', 'battery_critical', 'connectivity_lost', 'connectivity_restored'].includes(alert.type) &&
              !alert.acknowledged
            )
            .map((alert) => (
              <View key={alert.id} style={[
                styles.alertCard,
                alert.type === 'battery_critical' && styles.criticalAlert,
                alert.type === 'connectivity_lost' && styles.warningAlert,
                alert.type === 'connectivity_restored' && styles.successAlert,
              ]}>
                <View style={styles.alertHeader}>
                  {alert.type.includes('battery') ? (
                    <Battery size={20} color={alert.type === 'battery_critical' ? '#E74C3C' : '#F39C12'} />
                  ) : alert.type === 'connectivity_lost' ? (
                    <WifiOff size={20} color="#E74C3C" />
                  ) : (
                    <Wifi size={20} color="#27AE60" />
                  )}
                  <Text style={styles.alertTitle}>
                    {alert.type === 'low_battery' && 'Low Battery'}
                    {alert.type === 'battery_critical' && 'Critical Battery'}
                    {alert.type === 'connectivity_lost' && 'Connection Lost'}
                    {alert.type === 'connectivity_restored' && 'Connection Restored'}
                  </Text>
                  <Text style={styles.alertTime}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
            ))
          }
        </View>
      )}

      {/* Pending Commands */}
      {pendingCommands.length > 0 && (
        <View style={styles.pendingCard}>
          <View style={styles.pendingHeader}>
            <AlertCircle size={20} color="#F39C12" />
            <Text style={styles.pendingTitle}>
              {pendingCommands.filter((c: RemoteCommand) => c.status === 'pending').length} Pending Commands
            </Text>
          </View>
          <TouchableOpacity
            style={styles.processButton}
            onPress={processPendingCommands}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.processButtonText}>Process Commands</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Add Contact Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddContact(true)}
        testID="add-contact-button"
      >
        <Plus size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add New Contact</Text>
      </TouchableOpacity>

      {/* Add Contact Form */}
      {showAddContact && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add New Contact</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={newContact.name}
            onChangeText={(text) => setNewContact({ ...newContact, name: text })}
            testID="contact-name-input"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={newContact.phone}
            onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
            keyboardType="phone-pad"
            testID="contact-phone-input"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Photo URL (optional)"
            value={newContact.photo}
            onChangeText={(text) => setNewContact({ ...newContact, photo: text })}
            testID="contact-photo-input"
          />
          
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddContact(false);
                setNewContact({ name: '', phone: '', photo: '' });
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddContact}
            >
              <Text style={styles.saveButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit Contact Form */}
      {editingContact && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Edit Contact</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={editingContact.name}
            onChangeText={(text) => setEditingContact({ ...editingContact, name: text })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={editingContact.phone}
            onChangeText={(text) => setEditingContact({ ...editingContact, phone: text })}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Photo URL (optional)"
            value={editingContact.photo || ''}
            onChangeText={(text) => setEditingContact({ ...editingContact, photo: text })}
          />
          
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditingContact(null)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateContact}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Contacts List */}
      <View style={styles.contactsList}>
        <Text style={styles.sectionTitle}>📞 Contact Management</Text>
        
        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              {contact.photo ? (
                <Image source={{ uri: contact.photo }} style={styles.contactPhoto} />
              ) : (
                <View style={styles.contactPhotoPlaceholder}>
                  <Text style={styles.contactInitial}>
                    {contact.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <View style={styles.contactMeta}>
                  <Phone size={14} color="#7F8C8D" />
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                <View style={styles.contactBadges}>
                  {contact.isFavorite && (
                    <View style={styles.badge}>
                      <Star size={12} color="#F39C12" />
                      <Text style={styles.badgeText}>Favorite</Text>
                    </View>
                  )}
                  {contact.isEmergency && (
                    <View style={[styles.badge, styles.emergencyBadge]}>
                      <AlertCircle size={12} color="#E74C3C" />
                      <Text style={styles.badgeText}>Emergency</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setEditingContact(contact)}
                testID={`edit-contact-${contact.id}`}
              >
                <Edit2 size={18} color="#4A90E2" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteContact(contact.id)}
                testID={`delete-contact-${contact.id}`}
              >
                <Trash2 size={18} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {contacts.length === 0 && (
          <Text style={styles.emptyText}>No contacts added yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F4FD',
  },
  pendingCard: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#F39C12',
    borderRadius: 8,
    padding: 15,
    margin: 20,
    marginBottom: 10,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F39C12',
    marginLeft: 8,
  },
  processButton: {
    backgroundColor: '#F39C12',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#27AE60',
    borderRadius: 8,
    padding: 15,
    margin: 20,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactsList: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  contactPhotoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 5,
  },
  contactBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emergencyBadge: {
    backgroundColor: '#FFE5E5',
  },
  badgeText: {
    fontSize: 11,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 16,
    marginTop: 40,
  },
  alertsSection: {
    padding: 20,
    paddingTop: 10,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  criticalAlert: {
    borderLeftColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  warningAlert: {
    borderLeftColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  successAlert: {
    borderLeftColor: '#27AE60',
    backgroundColor: '#F0FFF4',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  alertMessage: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
  },
});