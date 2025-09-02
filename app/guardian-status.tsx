import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GuardianStatus } from '@/components/GuardianStatus';
import { COLORS } from '@/constants/launcher-config';

export default function GuardianStatusScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={COLORS.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Guardian Status</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <GuardianStatus showDetails={true} />
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Guardian Monitoring</Text>
          <Text style={styles.infoText}>
            Guardian monitoring helps keep your family informed about your phone&apos;s status:
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>🔋</Text>
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>Battery Monitoring:</Text> Alerts family when battery drops below 20% or becomes critically low (5%)
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>📶</Text>
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>Connectivity Monitoring:</Text> Notifies family if internet connection is lost
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>🛡️</Text>
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>Proactive Alerts:</Text> Family receives immediate notifications about potential issues
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>⏰</Text>
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>Smart Timing:</Text> Prevents spam by limiting alerts to once every 30 minutes
              </Text>
            </View>
          </View>
          
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>Privacy Note</Text>
            <Text style={styles.noteText}>
              Guardian monitoring only shares battery level and connectivity status with your family. 
              No personal data, location, or app usage is monitored or shared.
            </Text>
          </View>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  infoSection: {
    margin: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  featureList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  featureBullet: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  featureBold: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  noteSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
});