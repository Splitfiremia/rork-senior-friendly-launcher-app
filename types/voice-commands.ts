export interface VoiceCommand {
  id: string;
  phrases: string[];
  action: () => void | Promise<void>;
  description: string;
  category: 'navigation' | 'emergency' | 'settings' | 'apps' | 'contacts';
  enabled: boolean;
}

export interface VoiceCommandSettings {
  enabled: boolean;
  language: string;
  sensitivity: 'low' | 'medium' | 'high';
  confirmationRequired: boolean;
  feedbackEnabled: boolean;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  lastCommand: string | null;
  confidence: number;
  error: string | null;
}

export interface SpeechSynthesisSettings {
  enabled: boolean;
  voice: string | null;
  rate: number;
  pitch: number;
  volume: number;
}