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
        router.push('/message-composer');
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
            // Try different photo app URLs based on platform
            if (Platform.OS === 'ios') {
              await Linking.openURL('photos-redirect://');
            } else {
              // Android - try to open gallery
              await Linking.openURL('content://media/external/images/media');
            }
          } catch {
            Alert.alert('Photos', 'Unable to open photos app. Please open your device\'s photo gallery manually.');
          }
        } else {
          Alert.alert(
            'Photos', 
            'Photos functionality is available on mobile devices. On web, you can access photos through your browser or cloud storage.',
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Open Google Photos', 
                onPress: () => {
                  if (typeof window !== 'undefined') {
                    window.open('https://photos.google.com', '_blank');
                  }
                }
              }
            ]
          );
        }
        break;
      case 'weather':
        if (Platform.OS !== 'web') {
          try {
            // Try to open weather app
            await Linking.openURL('weather://');
          } catch {
            // Fallback to web weather
            await Linking.openURL('https://weather.com');
          }
        } else {
          if (typeof window !== 'undefined') {
            window.open('https://weather.com', '_blank');
          }
        }
        break;
      case 'news':
        if (Platform.OS !== 'web') {
          try {
            // Try to open news app
            await Linking.openURL('news://');
          } catch {
            // Fallback to web news
            await Linking.openURL('https://news.google.com');
          }
        } else {
          if (typeof window !== 'undefined') {
            window.open('https://news.google.com', '_blank');
          }
        }
        break;
      default:
        Alert.alert(
          tile.name, 
          `${tile.name} functionality is being prepared. This app will connect to your device's built-in apps when available.`
        );
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