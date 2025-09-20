import React, { useCallback } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { 
  Type, 
  Grid, 
  RotateCcw, 
  Phone,
  ChevronRight,
  Eye,
  Palette,
  Users,
  Shield,
  Battery,
  Globe,
  Mic,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { useLauncher, useEmergencyContact } from '@/hooks/launcher-context';
import { useDashboard } from '@/hooks/dashboard-context';
import { useRouter } from 'expo-router';
import { COLORS, TEXT_SIZES } from '@/constants/launcher-config';
import { LauncherSettings } from '@/types/launcher';

export default function SettingsScreen() {
  const { settings, updateSettings, resetToDefaults, appTiles, toggleAppVisibility } = useLauncher();
  const emergencyContact = useEmergencyContact();
  const { isPaired, isAuthenticated } = useDashboard();
  const router = useRouter();
  const textSizes = TEXT_SIZES[settings.textSize];

  // Debug logging
  console.log('SettingsScreen rendered');
  console.log('Settings:', settings);
  console.log('UpdateSettings function:', typeof updateSettings);
  console.log('AppTiles:', appTiles?.length || 0, 'tiles');
  console.log('ToggleAppVisibility function:', typeof toggleAppVisibility);
  console.log('Emergency contact:', emergencyContact?.name || 'None');
  console.log('Dashboard - isPaired:', isPaired, 'isAuthenticated:', isAuthenticated);

  const handleTextSizeChange = useCallback(async () => {
    console.log('handleTextSizeChange called');
    console.log('Current settings:', settings);
    console.log('UpdateSettings function type:', typeof updateSettings);
    
    if (!updateSettings) {
      console.error('updateSettings function is not available');
      Alert.alert('Error', 'Settings update function not available');
      return;
    }
    
    try {
      const sizes: LauncherSettings['textSize'][] = ['medium', 'large', 'extra-large'];
      const currentIndex = sizes.indexOf(settings.textSize);
      const nextIndex = (currentIndex + 1) % sizes.length;
      console.log('Updating text size from', settings.textSize, 'to', sizes[nextIndex]);
      
      await updateSettings({ textSize: sizes[nextIndex] });
      console.log('Text size updated successfully to:', sizes[nextIndex]);
    } catch (error) {
      console.error('Error updating text size:', error);
      Alert.alert('Error', 'Failed to update text size: ' + (error as Error).message);
    }
  }, [settings, updateSettings]);

  const handleGridSizeChange = useCallback(async () => {
    console.log('handleGridSizeChange called');
    console.log('Current settings:', settings);
    console.log('UpdateSettings function type:', typeof updateSettings);
    
    if (!updateSettings) {
      console.error('updateSettings function is not available');
      Alert.alert('Error', 'Settings update function not available');
      return;
    }
    
    try {
      const grids: LauncherSettings['gridSize'][] = ['2x2', '2x3', '3x3'];
      const currentIndex = grids.indexOf(settings.gridSize);
      const nextIndex = (currentIndex + 1) % grids.length;
      console.log('Updating grid size from', settings.gridSize, 'to', grids[nextIndex]);
      
      await updateSettings({ gridSize: grids[nextIndex] });
      console.log('Grid size updated successfully to:', grids[nextIndex]);
    } catch (error) {
      console.error('Error updating grid size:', error);
      Alert.alert('Error', 'Failed to update grid size: ' + (error as Error).message);
    }
  }, [settings, updateSettings]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset to Defaults',
      'This will reset all settings to their default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            console.log('Reset button pressed');
            console.log('ResetToDefaults function type:', typeof resetToDefaults);
            
            if (!resetToDefaults) {
              console.error('resetToDefaults function is not available');
              Alert.alert('Error', 'Reset function not available');
              return;
            }
            
            try {
              await resetToDefaults();
              console.log('Settings reset to defaults');
              Alert.alert('Success', 'Settings have been reset to defaults');
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('Error', 'Failed to reset settings: ' + (error as Error).message);
            }
          },
        },
      ]
    );
  }, [resetToDefaults]);

  const SettingRow = ({ 
    icon: Icon, 
    title, 
    value, 
    onPress, 
    showArrow = true,
    rightElement,
  }: {
    icon: React.ComponentType<any>;
    title: string;
    value?: string;
    onPress?: () => void | Promise<void>;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={async () => {
        console.log('SettingRow pressed:', title);
        if (onPress) {
          try {
            await onPress();
            console.log('SettingRow onPress completed for:', title);
          } catch (error) {
            console.error('Error in SettingRow onPress for', title, ':', error);
          }
        } else {
          console.log('No onPress handler for:', title);
        }
      }}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <Icon color={COLORS.primary} size={24} />
        <Text style={[styles.settingTitle, { fontSize: textSizes.subtitle }]}>
          {title}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {value && (
          <Text style={[styles.settingValue, { fontSize: textSizes.body }]}>
            {value}
          </Text>
        )}
        {rightElement}
        {showArrow && onPress && (
          <ChevronRight color={COLORS.textSecondary} size={20} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: textSizes.large }]}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>
            Display
          </Text>
          
          <SettingRow
            icon={Type}
            title="Text Size"
            value={settings.textSize.replace('-', ' ')}
            onPress={handleTextSizeChange}
          />
          
          <SettingRow
            icon={Grid}
            title="Home Grid Size"
            value={settings.gridSize}
            onPress={handleGridSizeChange}
          />
          
          <SettingRow
            icon={Palette}
            title="High Contrast"
            showArrow={false}
            rightElement={
              <Switch
                value={settings.highContrast}
                onValueChange={async (value: boolean) => {
                  console.log('High contrast switch changed to:', value);
                  console.log('UpdateSettings function type:', typeof updateSettings);
                  
                  if (!updateSettings) {
                    console.error('updateSettings function is not available');
                    Alert.alert('Error', 'Settings update function not available');
                    return;
                  }
                  
                  try {
                    await updateSettings({ highContrast: value });
                    console.log('High contrast set successfully to:', value);
                  } catch (error) {
                    console.error('Error updating high contrast:', error);
                    Alert.alert('Error', 'Failed to update high contrast setting: ' + (error as Error).message);
                  }
                }}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>
            Emergency
          </Text>
          
          <SettingRow
            icon={Phone}
            title="Emergency Contact"
            value={emergencyContact?.name || 'Not Set'}
            onPress={() => {
              console.log('Emergency contact pressed');
              try {
                Alert.alert('Emergency Contact', 'Go to Contacts to set an emergency contact', [
                  { text: 'OK', style: 'default' },
                  { text: 'Go to Contacts', onPress: () => {
                    console.log('Navigating to contacts');
                    router.push('/(tabs)/contacts');
                  }}
                ]);
              } catch (error) {
                console.error('Error showing emergency contact alert:', error);
              }
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>
            Family Dashboard
          </Text>
          
          <SettingRow
            icon={Users}
            title="Family Dashboard"
            value={isPaired ? 'Connected' : 'Not Connected'}
            onPress={() => {
              console.log('Family Dashboard pressed');
              try {
                router.push('/dashboard');
                console.log('Navigation to dashboard initiated');
              } catch (error) {
                console.error('Error navigating to dashboard:', error);
              }
            }}
          />
          
          <SettingRow
            icon={Shield}
            title="Remote Management"
            value={isAuthenticated ? 'Active' : 'Inactive'}
            onPress={() => {
              console.log('Remote Management pressed');
              try {
                router.push('/dashboard');
                console.log('Navigation to dashboard for remote management initiated');
              } catch (error) {
                console.error('Error navigating to dashboard for remote management:', error);
              }
            }}
          />
          
          <SettingRow
            icon={Battery}
            title="Guardian Status"
            value={isPaired ? 'Monitoring' : 'Inactive'}
            onPress={() => {
              console.log('Guardian Status pressed');
              try {
                router.push('/guardian-status');
                console.log('Navigation to guardian status initiated');
              } catch (error) {
                console.error('Error navigating to guardian status:', error);
              }
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>
            Accessibility
          </Text>
          
          <SettingRow
            icon={Mic}
            title="Voice Commands"
            value="Accessibility Feature"
            onPress={() => {
              console.log('Voice Commands pressed');
              try {
                router.push('/voice-settings');
                console.log('Navigation to voice settings initiated');
              } catch (error) {
                console.error('Error navigating to voice settings:', error);
              }
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>
            CareConnect
          </Text>
          
          <SettingRow
            icon={Globe}
            title="CareConnect Headquarters"
            value="Visit Website"
            onPress={() => {
              console.log('CareConnect Headquarters pressed');
              try {
                router.push('/landing');
                console.log('Navigation to landing page initiated');
              } catch (error) {
                console.error('Error navigating to landing page:', error);
              }
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: textSizes.subtitle }]}>
            Visible Apps
          </Text>
          
          {appTiles.map((tile) => (
            <SettingRow
              key={tile.id}
              icon={Eye}
              title={tile.name}
              showArrow={false}
              rightElement={
                <Switch
                  value={tile.isVisible}
                  onValueChange={async () => {
                    console.log('Switch toggled for app:', tile.name);
                    console.log('ToggleAppVisibility function type:', typeof toggleAppVisibility);
                    
                    if (!toggleAppVisibility) {
                      console.error('toggleAppVisibility function is not available');
                      Alert.alert('Error', 'App visibility toggle function not available');
                      return;
                    }
                    
                    try {
                      await toggleAppVisibility(tile.id);
                      console.log('App visibility toggled for:', tile.name);
                    } catch (error) {
                      console.error('Error toggling app visibility:', error);
                      Alert.alert('Error', 'Failed to update app visibility: ' + (error as Error).message);
                    }
                  }}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                />
              }
            />
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
          >
            <RotateCcw color="white" size={20} />
            <Text style={[styles.resetButtonText, { fontSize: textSizes.button }]}>
              Reset to Defaults
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { fontSize: textSizes.body }]}>
            Senior Launcher v1.0.0
          </Text>
          <Text style={[styles.footerText, { fontSize: textSizes.body }]}>
            Made with care for easy use
          </Text>
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
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    marginLeft: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    color: COLORS.textSecondary,
    marginRight: 8,
    textTransform: 'capitalize',
  },
  resetButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
});