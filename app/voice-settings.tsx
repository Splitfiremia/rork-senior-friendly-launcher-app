import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { VoiceCommandsSettings } from '@/components/VoiceCommandsSettings';
import { useLauncher } from '@/hooks/launcher-context';
import { COLORS, TEXT_SIZES } from '@/constants/launcher-config';

export default function VoiceSettingsScreen() {
  const { settings } = useLauncher();
  const textSizes = TEXT_SIZES[settings.textSize];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Voice Commands',
          headerStyle: {
            backgroundColor: COLORS.cardBackground,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontSize: textSizes.large,
            fontWeight: 'bold',
          },
        }} 
      />
      <VoiceCommandsSettings textSize={textSizes} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});