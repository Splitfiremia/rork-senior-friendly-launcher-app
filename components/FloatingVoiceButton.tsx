import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Mic, MicOff, Square } from 'lucide-react-native';
import { useVoiceCommands } from '@/hooks/voice-commands';
import { COLORS } from '@/constants/launcher-config';

interface FloatingVoiceButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({
  position = 'bottom-right',
  size = 'medium',
  showLabel = false,
}) => {
  const {
    voiceSettings,
    recognitionState,
    startListening,
    stopListening,
    isSupported,
  } = useVoiceCommands();

  const [pulseAnim] = useState(new Animated.Value(1));

  React.useEffect(() => {
    if (recognitionState.isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recognitionState.isListening, pulseAnim]);

  if (!isSupported || !voiceSettings.enabled) {
    return null;
  }

  const buttonSize = size === 'small' ? 48 : size === 'medium' ? 56 : 64;
  const iconSize = size === 'small' ? 20 : size === 'medium' ? 24 : 28;

  const positionStyles = {
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
  };

  const handlePress = () => {
    if (recognitionState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getButtonColor = () => {
    if (recognitionState.isListening) {
      return COLORS.error;
    }
    return COLORS.primary;
  };

  const getIcon = () => {
    if (recognitionState.isListening) {
      return <Square color="white" size={iconSize} />;
    }
    if (recognitionState.error) {
      return <MicOff color="white" size={iconSize} />;
    }
    return <Mic color="white" size={iconSize} />;
  };

  return (
    <View style={[styles.container, positionStyles[position]]}>
      {showLabel && recognitionState.isListening && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>Listening...</Text>
        </View>
      )}
      
      <Animated.View
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor: getButtonColor(),
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {getIcon()}
        </TouchableOpacity>
      </Animated.View>

      {recognitionState.error && (
        <View style={styles.errorIndicator}>
          <Text style={styles.errorText}>!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    alignItems: 'center',
  },
  button: {
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  labelContainer: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  labelText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  errorIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});