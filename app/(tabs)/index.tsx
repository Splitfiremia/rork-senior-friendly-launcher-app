import React from 'react';
import { ScrollView, View, StyleSheet, Dimensions, SafeAreaView, Text, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { useVisibleAppTiles, useLauncher } from '@/hooks/launcher-context';
import { useWellnessMonitoring } from '@/hooks/wellness-monitoring';
import AppTile from '@/components/AppTile';

import EmergencyButton from '@/components/EmergencyButton';
import Header from '@/components/Header';
import ImOkButton from '@/components/ImOkButton';
import { GuardianStatus } from '@/components/GuardianStatus';
import { COLORS } from '@/constants/launcher-config';
import { Radio, Gamepad2, Cloud, Newspaper } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { settings, recordActivity } = useLauncher();
  const visibleApps = useVisibleAppTiles();

  const router = useRouter();
  
  // Initialize wellness monitoring
  const { isGuardianActive } = useWellnessMonitoring();
  
  // Record activity when user interacts with the home screen
  React.useEffect(() => {
    recordActivity();
  }, [recordActivity]);

  const getTileSize = () => {
    const padding = 32;
    const margin = 16;
    
    switch (settings.gridSize) {
      case '2x2':
        return (width - padding - margin * 2) / 2;
      case '2x3':
        return (width - padding - margin * 2) / 2;
      case '3x3':
        return (width - padding - margin * 4) / 3;
      default:
        return (width - padding - margin * 2) / 2;
    }
  };

  const tileSize = getTileSize();
  const displayApps = settings.gridSize === '2x2' ? visibleApps.slice(0, 4) : 
                      settings.gridSize === '2x3' ? visibleApps.slice(0, 6) : 
                      visibleApps;

  const openWebLink = (url: string, title: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', `Unable to open ${title}`);
      });
    }
  };

  const quickEntertainment = [
    {
      id: 'radio',
      title: 'Radio',
      icon: <Radio size={24} color="#fff" />,
      color: '#FF6B6B',
      action: () => openWebLink('https://www.iheart.com/', 'Radio'),
    },
    {
      id: 'games',
      title: 'Games',
      icon: <Gamepad2 size={24} color="#fff" />,
      color: '#95E77E',
      action: () => openWebLink('https://www.solitr.com/', 'Games'),
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <Cloud size={24} color="#fff" />,
      color: '#87CEEB',
      action: () => openWebLink('https://weather.com/', 'Weather'),
    },
    {
      id: 'news',
      title: 'News',
      icon: <Newspaper size={24} color="#fff" />,
      color: '#A8E6CF',
      action: () => openWebLink('https://news.google.com/', 'News'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ImOkButton />
        <EmergencyButton />
        
        {isGuardianActive && (
          <GuardianStatus />
        )}
        
        <View style={styles.appsGrid}>
          {displayApps.map((tile) => (
            <AppTile
              key={tile.id}
              tile={tile}
              size={tileSize}
            />
          ))}
        </View>

        <View style={styles.quickAccessSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <TouchableOpacity onPress={() => router.push('/entertainment')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickAccessScroll}
          >
            {quickEntertainment.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickAccessCard}
                onPress={item.action}
                activeOpacity={0.8}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: item.color }]}>
                  {item.icon}
                </View>
                <Text style={styles.quickAccessTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 8,
  },

  quickAccessSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickAccessScroll: {
    paddingRight: 16,
  },
  quickAccessCard: {
    marginRight: 12,
    alignItems: 'center',
    width: 90,
  },
  quickAccessIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});