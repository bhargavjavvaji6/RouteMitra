import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  Compass,
  Home,
  Fuel,
  Briefcase,
  Split,
  Check,
  AlertTriangle,
  Radio,
  CloudRain,
} from 'lucide-react';
import {
  parseNavigationVoiceCommand,
  speakFeedback,
  VoiceCommandResult,
} from '../services/voiceNavigationService';

interface VoiceCommandListenerProps {
  onCommand: (result: VoiceCommandResult) => void;
  className?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// Check for Web Speech Recognition in browser
const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  // @ts-expect-error - webkitSpeechRecognition is available in modern Chromium/Safari
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export const VoiceCommandListener: React.FC<VoiceCommandListenerProps> = ({
  onCommand,
  className = '',
  buttonSize = 'md',
  showLabel = false,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [lastCommand, setLastCommand] = useState<VoiceCommandResult | null>(null);

  // Recognition instance ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Suggested driving voice commands for hands-free driving
  const quickCommands = [
    { label: 'Find gas station', icon: <Fuel className="w-3.5 h-3.5 text-amber-400" />, query: 'find gas station' },
    { label: 'Take me home', icon: <Home className="w-3.5 h-3.5 text-emerald-400" />, query: 'take me home' },
    { label: 'Office', icon: <Briefcase className="w-3.5 h-3.5 text-blue-400" />, query: 'go to office' },
    { label: 'Reroute / Avoid traffic', icon: <Split className="w-3.5 h-3.5 text-cyan-400" />, query: 'reroute avoid traffic' },
    { label: 'Weather condition', icon: <CloudRain className="w-3.5 h-3.5 text-sky-400" />, query: 'weather' },
    { label: 'Mute guidance', icon: <Volume2 className="w-3.5 h-3.5 text-purple-400" />, query: 'mute' },
  ];

  const handleExecuteVoiceCommand = (text: string) => {
    const result = parseNavigationVoiceCommand(text);
    setLastCommand(result);
    setFeedbackMessage(result.description);
    speakFeedback(result.feedbackSpeech);
    onCommand(result);

    // Keep dialog open briefly to show feedback before auto-dismissing
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowOverlay(false);
      setIsListening(false);
      setTranscript('');
      setInterimTranscript('');
      setFeedbackMessage(null);
    }, 2200);
  };

  const startListening = () => {
    setShowOverlay(true);
    setTranscript('');
    setInterimTranscript('');
    setFeedbackMessage(null);
    setLastCommand(null);

    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) {
      setIsListening(true);
      setFeedbackMessage('Listening (Microphone simulated)... Try saying or tapping a command below:');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English / Global English

      recognition.onstart = () => {
        setIsListening(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentFinal) {
          setTranscript(currentFinal);
          handleExecuteVoiceCommand(currentFinal);
        } else if (currentInterim) {
          setInterimTranscript(currentInterim);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setFeedbackMessage('Microphone permission blocked. You can tap quick voice commands below:');
        } else {
          setFeedbackMessage('No speech detected. Tap or say a command:');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition failed to initialize:', err);
      setIsListening(true);
      setFeedbackMessage('Say or tap a voice navigation command:');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setShowOverlay(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const sizeClasses =
    buttonSize === 'lg'
      ? 'w-14 h-14'
      : buttonSize === 'sm'
      ? 'w-9 h-9'
      : 'w-12 h-12';

  const iconSizes =
    buttonSize === 'lg'
      ? 'w-6 h-6'
      : buttonSize === 'sm'
      ? 'w-4 h-4'
      : 'w-5 h-5';

  return (
    <>
      {/* ── Trigger Button (Optimized for hands-free driving HUD) ── */}
      <button
        type="button"
        onClick={startListening}
        className={`relative rounded-full backdrop-blur-xl border flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xl ${sizeClasses} ${
          isListening
            ? 'bg-rose-500 text-white border-rose-400 ring-4 ring-rose-500/40 animate-pulse'
            : 'bg-[#0F1722]/95 text-cyan-300 border-cyan-500/40 hover:bg-[#1A2636] hover:border-cyan-400 shadow-[0_6px_20px_rgba(6,182,212,0.35)]'
        } ${className}`}
        title="Voice-to-Text: Hands-Free Navigation Listener (Say 'Find gas station' or 'Home')"
      >
        {isListening ? (
          <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping" />
        ) : null}

        <div className="flex items-center gap-1.5">
          <Mic className={`${iconSizes} stroke-[2.2]`} />
          {showLabel && (
            <span className="text-xs font-bold pr-1 text-white">Voice</span>
          )}
        </div>
      </button>

      {/* ── Hands-Free Voice Listener Driving Overlay ── */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in select-none">
          <div className="bg-[#0C141F] border border-cyan-500/30 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-4 relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={stopListening}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Status Header */}
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div className="min-w-0">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span>Hands-Free Driving Voice Assistant</span>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </h3>
                <p className="text-[11px] text-slate-400">
                  Speak clearly while driving • Instant route execution
                </p>
              </div>
            </div>

            {/* Central Animated Audio Waveform & Microphone Visualizer */}
            <div className="py-4 px-4 rounded-2xl bg-[#142131]/80 border border-cyan-500/20 text-center space-y-3">
              {/* Pulsing Mic Circle */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(6,182,212,0.6)]">
                  <Mic className="w-8 h-8 animate-bounce" />
                </div>
              </div>

              {/* Dynamic Sound Equalizer Bars */}
              <div className="flex items-center justify-center gap-1 h-6">
                {[4, 12, 20, 16, 24, 14, 22, 10, 18, 6].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-cyan-400 animate-pulse"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>

              {/* Live Transcript / Hearing Box */}
              <div className="min-h-[44px] flex items-center justify-center px-3">
                {interimTranscript || transcript ? (
                  <p className="text-base font-bold text-cyan-200 animate-fade-in">
                    &quot;{transcript || interimTranscript}&quot;
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-slate-400 animate-pulse">
                    Listening for voice command...
                  </p>
                )}
              </div>

              {/* Feedback Alert if recognized */}
              {feedbackMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}
            </div>

            {/* Quick Touch Voice Commands (Safely testable while driving) */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Popular Voice Navigation Commands:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {quickCommands.map((cmd) => (
                  <button
                    key={cmd.label}
                    type="button"
                    onClick={() => {
                      setTranscript(cmd.query);
                      handleExecuteVoiceCommand(cmd.query);
                    }}
                    className="p-2.5 rounded-xl bg-[#131E2A] hover:bg-[#1A2A3B] border border-slate-700/70 hover:border-cyan-500/40 text-left text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all cursor-pointer group active:scale-95"
                  >
                    <span className="p-1 rounded-lg bg-white/5 group-hover:bg-cyan-500/20 transition-colors shrink-0">
                      {cmd.icon}
                    </span>
                    <span className="truncate">{cmd.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={stopListening}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Voice Assistant
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
