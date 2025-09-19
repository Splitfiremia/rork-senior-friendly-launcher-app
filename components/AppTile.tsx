import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Icons from 'lucide-react-native';
import { AppTile as AppTileType } from '@/types/launcher';
import { useLauncher } from '@/hooks/launcher-context';
import { TEXT_SIZES } from '@/constants/launcher-config';
import { useCameraPermissions } from 'expo-camera';

interface AppTileProps {
  tile: AppTileType;
  size: number;
  onPress?: () => void;
}

export default function AppTile({ tile, size, onPress }: AppTileProps) {
  const { settings } = useLauncher();
  const router = useRouter();
  const textSizes = TEXT_SIZES[settings.textSize];
  
  const IconComponent = Icons[tile.icon as keyof typeof Icons] as React.ComponentType<any>;

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    switch (tile.action) {
      case 'phone':
        router.push('/phone-dialer');
        break;
      case 'messages':
        if (Platform.OS !== 'web') {
          try {
            await Linking.openURL('sms:');
          } catch {
            Alert.alert('Messages', 'Unable to open messages app');
          }
        } else {
          Alert.alert('Messages', 'Messages functionality is available on mobile devices');
        }
        break;
      case 'camera':
        if (Platform.OS === 'web') {
          // For web, we can still show camera but with limitations
          router.push('/camera');
        } else {
          // For mobile, check permissions first
          if (!cameraPermission?.granted) {
            const permission = await requestCameraPermission();
            if (!permission.granted) {
              Alert.alert('Camera Permission', 'Camera permission is required to use this feature');
              return;
            }
          }
          router.push('/camera');
        }
        break;
      case 'photos':
        if (Platform.OS !== 'web') {
          try {
            await Linking.openURL('photos-redirect://');
          } catch {
            Alert.alert('Photos', 'Unable to open photos app');
          }
        } else {
          Alert.alert('Photos', 'Photos functionality is available on mobile devices');
        }
        break;
      case 'weather':
        Alert.alert('Weather', 'Weather app integration coming soon');
        break;
      case 'news':
        Alert.alert('News', 'News app integration coming soon');
        break;
      default:
        Alert.alert(tile.name, `${tile.name} functionality coming soon`);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          backgroundColor: tile.color,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      testID={`app-tile-${tile.id}`}
    >
      <View style={styles.iconContainer}>
        {IconComponent && (
          <IconComponent
            color="white"
            size={size * 0.35}
            strokeWidth={2}
          />
        )}
      </View>
      <Text
        style={[
          styles.label,
          {
            fontSize: textSizes.button,
          },
        ]}
        numberOfLines={1}
      >
        {tile.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 8,
  },
  label: {
    color: 'white',
    fontWeight: '600',
    paddingHorizontal: 8,
  },
});