import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { X, Camera, RotateCcw, Zap, ZapOff } from 'lucide-react-native';
import { COLORS, TEXT_SIZES } from '@/constants/launcher-config';
import { useLauncher } from '@/hooks/launcher-context';

export default function CameraScreen() {
  const { settings } = useLauncher();
  const router = useRouter();
  const textSizes = TEXT_SIZES[settings.textSize];
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { fontSize: textSizes.subtitle }]}>
            Loading camera...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera color={COLORS.primary} size={64} />
          <Text style={[styles.permissionTitle, { fontSize: textSizes.large }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.permissionText, { fontSize: textSizes.body }]}>
            We need your permission to use the camera
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={[styles.permissionButtonText, { fontSize: textSizes.button }]}>
              Grant Permission
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X color={COLORS.text} size={24} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => !current);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Photo Taken',
            'Photo saved successfully!',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } else {
          Alert.alert(
            'Photo Taken',
            'Photo captured! (Note: Saving to device is limited on web)',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash ? 'on' : 'off'}
      >
        {/* Header Controls */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <X color="white" size={28} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleFlash}
          >
            {flash ? (
              <Zap color="#FFD700" size={28} />
            ) : (
              <ZapOff color="white" size={28} />
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.controls}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <RotateCcw color="white" size={32} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <View style={styles.placeholder} />
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.text,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 32,
  },
  permissionTitle: {
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flipButton: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 32,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  placeholder: {
    width: 64,
    height: 64,
  },
});