import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Icons from 'lucide-react-native';
import { AppTile as AppTileType } from '@/types/launcher';
import { useLauncher } from '@/hooks/launcher-context';
import { TEXT_SIZES, COLORS } from '@/constants/launcher-config';

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

  const handlePress = () => {
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
          Linking.openURL('sms:');
        } else {
          Alert.alert('Messages', 'Messages app would open here');
        }
        break;
      case 'camera':
        Alert.alert('Camera', 'Camera app would open here');
        break;
      case 'photos':
        Alert.alert('Photos', 'Photos app would open here');
        break;
      case 'weather':
        Alert.alert('Weather', 'Weather app would open here');
        break;
      case 'news':
        Alert.alert('News', 'News app would open here');
        break;
      default:
        Alert.alert(tile.name, `${tile.name} would open here`);
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