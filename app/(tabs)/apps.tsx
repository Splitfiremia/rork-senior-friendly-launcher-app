import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useLauncher } from '@/hooks/launcher-context';
import AppTile from '@/components/AppTile';
import { COLORS, TEXT_SIZES } from '@/constants/launcher-config';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AppsScreen() {
  const { appTiles, settings } = useLauncher();
  const textSizes = TEXT_SIZES[settings.textSize];
  
  const tileSize = (width - 48) / 3; // 3 columns with padding

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: textSizes.large }]}>All Apps</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.appsGrid}>
          {appTiles.map((tile) => (
            <AppTile
              key={tile.id}
              tile={tile}
              size={tileSize}
              onPress={() => {
                if (tile.action === 'settings') {
                  router.push('/settings');
                } else if (tile.action === 'contacts') {
                  router.push('/contacts');
                }
              }}
            />
          ))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});