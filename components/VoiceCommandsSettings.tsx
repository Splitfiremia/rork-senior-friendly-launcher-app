import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  Play,
  Square,
} from 'lucide-react-native';
import { useVoiceCommands } from '@/hooks/voice-commands';
import { COLORS } from '@/constants/launcher-config';

interface VoiceCommandsSettingsProps {
  textSize: {
    subtitle: number;
    body: number;
    button: number;
  };
}

export const VoiceCommandsSettings: React.FC<VoiceCommandsSettingsProps> = ({ textSize }) => {
  const {
    voiceSettings,
    speechSettings,
    recognitionState,

    startListening,
    stopListening,
    speak,
    saveVoiceSettings,
    saveSpeechSettings,
    getCommandsByCategory,
    isSupported,
  } = useVoiceCommands();

  const handleToggleVoiceCommands = async (enabled: boolean) => {
    await saveVoiceSettings({ ...voiceSettings, enabled });
  };

  const handleToggleSpeechFeedback = async (enabled: boolean) => {
    await saveSpeechSettings({ ...speechSettings, enabled });
  };

  const handleSensitivityChange = async () => {
    const levels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const currentIndex = levels.indexOf(voiceSettings.sensitivity);
    const nextIndex = (currentIndex + 1) % levels.length;
    await saveVoiceSettings({ ...voiceSettings, sensitivity: levels[nextIndex] });
  };

  const handleToggleConfirmation = async (enabled: boolean) => {
    await saveVoiceSettings({ ...voiceSettings, confirmationRequired: enabled });
  };

  const handleToggleFeedback = async (enabled: boolean) => {
    await saveVoiceSettings({ ...voiceSettings, feedbackEnabled: enabled });
  };

  const testSpeech = () => {
    speak('Voice commands are working correctly. You can now use voice to control the app.');
  };

  const showVoiceCommandsHelp = () => {
    const navigationCommands = getCommandsByCategory('navigation');
    const emergencyCommands = getCommandsByCategory('emergency');
    const settingsCommands = getCommandsByCategory('settings');
    
    let helpText = 'Available Voice Commands:\n\n';
    
    if (navigationCommands.length > 0) {
      helpText += 'Navigation:\n';
      navigationCommands.forEach(cmd => {
        helpText += `• "${cmd.phrases[0]}" - ${cmd.description}\n`;
      });
      helpText += '\n';
    }
    
    if (emergencyCommands.length > 0) {
      helpText += 'Emergency:\n';
      emergencyCommands.forEach(cmd => {
        helpText += `• "${cmd.phrases[0]}" - ${cmd.description}\n`;
      });
      helpText += '\n';
    }
    
    if (settingsCommands.length > 0) {
      helpText += 'Settings:\n';
      settingsCommands.forEach(cmd => {
        helpText += `• "${cmd.phrases[0]}" - ${cmd.description}\n`;
      });
    }

    if (Platform.OS === 'web') {
      console.log(helpText);
      speak('Voice commands help has been logged to the console. Check the browser console for details.');
    } else {
      console.log('Voice Commands Help:', helpText);
      speak('Voice commands help is available. Check the console for details.');
    }
  };

  if (!isSupported) {
    return (
      <View style={styles.unsupportedContainer}>
        <MicOff color={COLORS.textSecondary} size={48} />
        <Text style={[styles.unsupportedText, { fontSize: textSize.body }]}>
          Voice commands are not supported on this device or browser.
        </Text>
        <Text style={[styles.unsupportedSubtext, { fontSize: textSize.body }]}>
          Voice commands require a modern web browser with speech recognition support.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: textSize.subtitle }]}>
          Voice Commands
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Mic color={COLORS.primary} size={24} />
            <Text style={[styles.settingTitle, { fontSize: textSize.body }]}>
              Enable Voice Commands
            </Text>
          </View>
          <Switch
            value={voiceSettings.enabled}
            onValueChange={handleToggleVoiceCommands}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>

        {voiceSettings.enabled && (
          <>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleSensitivityChange}
            >
              <View style={styles.settingLeft}>
                <Settings color={COLORS.primary} size={24} />
                <Text style={[styles.settingTitle, { fontSize: textSize.body }]}>
                  Sensitivity
                </Text>
              </View>
              <Text style={[styles.settingValue, { fontSize: textSize.body }]}>
                {voiceSettings.sensitivity.charAt(0).toUpperCase() + voiceSettings.sensitivity.slice(1)}
              </Text>
            </TouchableOpacity>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Settings color={COLORS.primary} size={24} />
                <Text style={[styles.settingTitle, { fontSize: textSize.body }]}>
                  Require Confirmation
                </Text>
              </View>
              <Switch
                value={voiceSettings.confirmationRequired}
                onValueChange={handleToggleConfirmation}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Volume2 color={COLORS.primary} size={24} />
                <Text style={[styles.settingTitle, { fontSize: textSize.body }]}>
                  Voice Feedback
                </Text>
              </View>
              <Switch
                value={voiceSettings.feedbackEnabled}
                onValueChange={handleToggleFeedback}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: textSize.subtitle }]}>
          Speech Synthesis
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            {speechSettings.enabled ? (
              <Volume2 color={COLORS.primary} size={24} />
            ) : (
              <VolumeX color={COLORS.textSecondary} size={24} />
            )}
            <Text style={[styles.settingTitle, { fontSize: textSize.body }]}>
              Enable Speech Output
            </Text>
          </View>
          <Switch
            value={speechSettings.enabled}
            onValueChange={handleToggleSpeechFeedback}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>

        {speechSettings.enabled && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={testSpeech}
          >
            <Play color="white" size={20} />
            <Text style={[styles.testButtonText, { fontSize: textSize.button }]}>
              Test Speech
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {voiceSettings.enabled && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: textSize.subtitle }]}>
            Voice Control
          </Text>
          
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                recognitionState.isListening && styles.controlButtonActive
              ]}
              onPress={recognitionState.isListening ? stopListening : startListening}
              disabled={!voiceSettings.enabled}
            >
              {recognitionState.isListening ? (
                <Square color="white" size={24} />
              ) : (
                <Mic color="white" size={24} />
              )}
              <Text style={[styles.controlButtonText, { fontSize: textSize.button }]}>
                {recognitionState.isListening ? 'Stop Listening' : 'Start Listening'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helpButton}
              onPress={showVoiceCommandsHelp}
            >
              <HelpCircle color={COLORS.primary} size={24} />
              <Text style={[styles.helpButtonText, { fontSize: textSize.button }]}>
                Show Commands
              </Text>
            </TouchableOpacity>
          </View>

          {recognitionState.isListening && (
            <View style={styles.listeningIndicator}>
              <Text style={[styles.listeningText, { fontSize: textSize.body }]}>
                🎤 Listening... Speak a command
              </Text>
            </View>
          )}

          {recognitionState.lastCommand && (
            <View style={styles.lastCommandContainer}>
              <Text style={[styles.lastCommandLabel, { fontSize: textSize.body }]}>
                Last Command:
              </Text>
              <Text style={[styles.lastCommandText, { fontSize: textSize.body }]}>
                &quot;{recognitionState.lastCommand}&quot;
              </Text>
              <Text style={[styles.confidenceText, { fontSize: textSize.body }]}>
                Confidence: {Math.round(recognitionState.confidence * 100)}%
              </Text>
            </View>
          )}

          {recognitionState.error && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { fontSize: textSize.body }]}>
                Error: {recognitionState.error}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  unsupportedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  unsupportedText: {
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  unsupportedSubtext: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
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
  settingValue: {
    color: COLORS.textSecondary,
    marginRight: 8,
    textTransform: 'capitalize',
  },
  testButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
  },
  controlButtonActive: {
    backgroundColor: COLORS.error,
  },
  controlButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  helpButton: {
    backgroundColor: COLORS.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
  },
  helpButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  listeningIndicator: {
    backgroundColor: COLORS.primary + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  listeningText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  lastCommandContainer: {
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  lastCommandLabel: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  lastCommandText: {
    color: COLORS.text,
    marginTop: 4,
    fontStyle: 'italic',
  },
  confidenceText: {
    color: COLORS.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: COLORS.error,
    fontWeight: '600',
  },
});