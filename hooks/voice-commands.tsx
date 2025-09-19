import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useLauncher } from '@/hooks/launcher-context';
import { VoiceCommand, VoiceCommandSettings, VoiceRecognitionState, SpeechSynthesisSettings } from '@/types/voice-commands';

interface VoiceCommandsHookProps {
  onCommandExecuted?: (command: VoiceCommand) => void;
}

export const useVoiceCommands = ({ onCommandExecuted }: VoiceCommandsHookProps = {}) => {
  const router = useRouter();
  const { contacts, updateSettings, recordActivity, settings } = useLauncher();
  
  const [voiceSettings, setVoiceSettings] = useState<VoiceCommandSettings>({
    enabled: false,
    language: 'en-US',
    sensitivity: 'medium',
    confirmationRequired: true,
    feedbackEnabled: true,
  });
  
  const [speechSettings, setSpeechSettings] = useState<SpeechSynthesisSettings>({
    enabled: true,
    voice: null,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });
  
  const [recognitionState, setRecognitionState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    lastCommand: null,
    confidence: 0,
    error: null,
  });
  
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const speak = useCallback((text: string) => {
    if (!speechSettings.enabled || Platform.OS !== 'web' || !speechSynthesisRef.current) {
      return;
    }
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechSettings.rate;
      utterance.pitch = speechSettings.pitch;
      utterance.volume = speechSettings.volume;
      
      if (speechSettings.voice) {
        const voices = speechSynthesisRef.current.getVoices();
        const selectedVoice = voices.find((voice: any) => voice.name === speechSettings.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      speechSynthesisRef.current.speak(utterance);
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  }, [speechSettings]);
  
  // Define voice commands with useMemo to prevent re-creation
  const voiceCommands = useMemo<VoiceCommand[]>(() => [
    // Navigation commands
    {
      id: 'go-home',
      phrases: ['go home', 'home screen', 'main screen'],
      action: () => router.push('/(tabs)' as any),
      description: 'Navigate to home screen',
      category: 'navigation',
      enabled: true,
    },
    {
      id: 'open-contacts',
      phrases: ['open contacts', 'show contacts', 'contacts'],
      action: () => router.push('/(tabs)/contacts'),
      description: 'Open contacts screen',
      category: 'navigation',
      enabled: true,
    },
    {
      id: 'open-settings',
      phrases: ['open settings', 'settings', 'preferences'],
      action: () => router.push('/(tabs)/settings'),
      description: 'Open settings screen',
      category: 'navigation',
      enabled: true,
    },
    {
      id: 'open-apps',
      phrases: ['open apps', 'show apps', 'applications'],
      action: () => router.push('/(tabs)/apps'),
      description: 'Open apps screen',
      category: 'navigation',
      enabled: true,
    },
    {
      id: 'open-entertainment',
      phrases: ['open entertainment', 'entertainment', 'games'],
      action: () => router.push('/(tabs)/entertainment'),
      description: 'Open entertainment screen',
      category: 'navigation',
      enabled: true,
    },
    {
      id: 'open-reminders',
      phrases: ['open reminders', 'reminders', 'tasks'],
      action: () => router.push('/(tabs)/reminders'),
      description: 'Open reminders screen',
      category: 'navigation',
      enabled: true,
    },
    
    // Emergency commands
    {
      id: 'emergency-call',
      phrases: ['emergency', 'help me', 'call for help', 'emergency call'],
      action: () => {
        const emergencyContact = contacts.find(c => c.isEmergency);
        if (emergencyContact) {
          console.log('Emergency call initiated for:', emergencyContact.name);
          speak(`Calling ${emergencyContact.name}`);
        } else {
          speak('No emergency contact found. Please set one in settings.');
        }
      },
      description: 'Initiate emergency call',
      category: 'emergency',
      enabled: true,
    },
    
    // Settings commands
    {
      id: 'increase-text-size',
      phrases: ['make text bigger', 'increase text size', 'larger text'],
      action: async () => {
        const sizes: ('medium' | 'large' | 'extra-large')[] = ['medium', 'large', 'extra-large'];
        const currentIndex = sizes.findIndex(size => size === settings.textSize);
        const nextIndex = Math.min(currentIndex + 1, sizes.length - 1);
        await updateSettings({ textSize: sizes[nextIndex] });
        speak(`Text size changed to ${sizes[nextIndex]}`);
      },
      description: 'Increase text size',
      category: 'settings',
      enabled: true,
    },
    {
      id: 'decrease-text-size',
      phrases: ['make text smaller', 'decrease text size', 'smaller text'],
      action: async () => {
        const sizes: ('medium' | 'large' | 'extra-large')[] = ['medium', 'large', 'extra-large'];
        const currentIndex = sizes.findIndex(size => size === settings.textSize);
        const nextIndex = Math.max(currentIndex - 1, 0);
        await updateSettings({ textSize: sizes[nextIndex] });
        speak(`Text size changed to ${sizes[nextIndex]}`);
      },
      description: 'Decrease text size',
      category: 'settings',
      enabled: true,
    },
    
    // App commands
    {
      id: 'open-phone',
      phrases: ['open phone', 'phone app', 'make a call'],
      action: () => router.push('/phone-dialer'),
      description: 'Open phone dialer',
      category: 'apps',
      enabled: true,
    },
    {
      id: 'open-camera',
      phrases: ['open camera', 'take photo', 'camera'],
      action: () => router.push('/camera'),
      description: 'Open camera',
      category: 'apps',
      enabled: true,
    },
    
    // Contact commands
    {
      id: 'call-first-contact',
      phrases: ['call first contact', 'call favorite'],
      action: () => {
        const favoriteContact = contacts.find(c => c.isFavorite);
        if (favoriteContact) {
          console.log('Calling favorite contact:', favoriteContact.name);
          speak(`Calling ${favoriteContact.name}`);
        } else {
          speak('No favorite contact found');
        }
      },
      description: 'Call first favorite contact',
      category: 'contacts',
      enabled: true,
    },
  ], [router, contacts, updateSettings, settings.textSize, speak]);
  
  const executeCommand = useCallback(async (command: VoiceCommand) => {
    if (!command || typeof command.action !== 'function') return;
    
    try {
      await command.action();
      await recordActivity();
      
      if (voiceSettings.feedbackEnabled) {
        speak(`${command.description} executed`);
      }
      
      onCommandExecuted?.(command);
    } catch (error) {
      console.error('Error executing voice command:', error);
      if (voiceSettings.feedbackEnabled) {
        speak('Sorry, there was an error executing that command.');
      }
    }
  }, [voiceSettings.feedbackEnabled, recordActivity, onCommandExecuted, speak]);
  
  const processVoiceCommand = useCallback((transcript: string, confidence: number) => {
    if (!voiceSettings.enabled) return;
    
    const minConfidence = voiceSettings.sensitivity === 'high' ? 0.6 : 
                         voiceSettings.sensitivity === 'medium' ? 0.7 : 0.8;
    
    if (confidence < minConfidence) {
      if (voiceSettings.feedbackEnabled) {
        speak('Sorry, I didn\'t understand that clearly. Please try again.');
      }
      return;
    }
    
    const matchedCommand = voiceCommands.find(command => 
      command.enabled && command.phrases.some(phrase => 
        transcript.includes(phrase.toLowerCase())
      )
    );
    
    if (matchedCommand) {
      if (voiceSettings.confirmationRequired && matchedCommand.category === 'emergency') {
        speak(`Confirm: ${matchedCommand.description}? Say yes to execute.`);
        // In a real implementation, you'd wait for confirmation
        setTimeout(() => executeCommand(matchedCommand), 2000);
      } else {
        executeCommand(matchedCommand);
      }
    } else {
      if (voiceSettings.feedbackEnabled) {
        speak('Command not recognized. Say "help" for available commands.');
      }
    }
  }, [voiceSettings, voiceCommands, executeCommand, speak]);
  
  // Initialize voice recognition
  useEffect(() => {
    if (Platform.OS === 'web') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = voiceSettings.language;
        
        recognitionRef.current.onstart = () => {
          setRecognitionState(prev => ({ ...prev, isListening: true, error: null }));
        };
        
        recognitionRef.current.onend = () => {
          setRecognitionState(prev => ({ ...prev, isListening: false }));
        };
        
        recognitionRef.current.onresult = (event: any) => {
          const result = event.results[0];
          const transcript = result.transcript.toLowerCase().trim();
          const confidence = result.confidence;
          
          setRecognitionState(prev => ({
            ...prev,
            lastCommand: transcript,
            confidence,
          }));
          
          processVoiceCommand(transcript, confidence);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          setRecognitionState(prev => ({
            ...prev,
            error: event.error,
            isListening: false,
          }));
        };
        
        setRecognitionState(prev => ({ ...prev, isSupported: true }));
      }
      
      // Initialize speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesisRef.current = window.speechSynthesis;
      }
    }
  }, [voiceSettings.language, processVoiceCommand]);
  
  const saveVoiceSettings = useCallback(async (newSettings: VoiceCommandSettings) => {
    if (!newSettings || typeof newSettings !== 'object') return;
    try {
      setVoiceSettings(newSettings);
      console.log('Voice settings saved:', newSettings);
    } catch (error) {
      console.error('Error saving voice settings:', error);
    }
  }, []);
  
  const saveSpeechSettings = useCallback(async (newSettings: SpeechSynthesisSettings) => {
    if (!newSettings || typeof newSettings !== 'object') return;
    try {
      setSpeechSettings(newSettings);
      console.log('Speech settings saved:', newSettings);
    } catch (error) {
      console.error('Error saving speech settings:', error);
    }
  }, []);
  
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !voiceSettings.enabled || recognitionState.isListening) {
      return;
    }
    
    try {
      recognitionRef.current.start();
      
      // Auto-stop after 10 seconds
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 10000);
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setRecognitionState(prev => ({ ...prev, error: 'Failed to start listening' }));
    }
  }, [voiceSettings.enabled, recognitionState.isListening]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current && recognitionState.isListening) {
      recognitionRef.current.stop();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [recognitionState.isListening]);
  
  const getAvailableVoices = useCallback(() => {
    if (Platform.OS === 'web' && speechSynthesisRef.current) {
      return speechSynthesisRef.current.getVoices();
    }
    return [];
  }, []);
  
  const getCommandsByCategory = useCallback((category: VoiceCommand['category']) => {
    return voiceCommands.filter(cmd => cmd.category === category && cmd.enabled);
  }, [voiceCommands]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current && recognitionState.isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [recognitionState.isListening]);
  
  return {
    voiceSettings,
    speechSettings,
    recognitionState,
    voiceCommands,
    startListening,
    stopListening,
    speak,
    saveVoiceSettings,
    saveSpeechSettings,
    getAvailableVoices,
    getCommandsByCategory,
    isSupported: recognitionState.isSupported && Platform.OS === 'web',
  };
};