import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Loader2, X, Radio, AlertCircle, Send } from 'lucide-react';
import { Language } from '../types';
import { CleanFormattedText } from '../utils/textUtils';

interface VoiceAssistantModalProps {
  currentLang: Language;
  onClose: () => void;
}

// Convert mic float32 buffer to 16-bit PCM Base64 (16kHz)
function float32ToBase64PCM(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert 24kHz Base64 PCM to Float32Array
function base64PCMToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16Array = new Int16Array(buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7fff);
  }
  return float32Array;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'speaking' | 'listening' | 'error' | 'closed'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [micMuted, setMicMuted] = useState<boolean>(false);

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeAudioSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Start Live Session
  useEffect(() => {
    let isMounted = true;

    async function initLiveSession() {
      try {
        setStatus('connecting');
        setErrorMessage('');

        // 1. Establish WebSocket Connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/live-ws`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        // Output AudioContext (24kHz for Gemini Live model output)
        const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        outputAudioCtxRef.current = outputAudioCtx;

        ws.onopen = () => {
          if (!isMounted) return;
          console.log('connected to Live API WebSocket server');
        };

        ws.onmessage = async (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'ready') {
              setStatus('listening');
              startMicrophone(ws);
            } else if (data.type === 'audio' && data.audio) {
              setStatus('speaking');
              playAudioChunk(data.audio);
            } else if (data.type === 'text' && data.text) {
              setLiveTranscript((prev) => prev + data.text);
            } else if (data.type === 'interrupted') {
              stopAllAudioPlayback();
              setStatus('listening');
            } else if (data.type === 'turnComplete') {
              setStatus('listening');
            } else if (data.type === 'error') {
              console.error('Live API Error:', data.error);
              setErrorMessage(data.error || 'Live API Error');
              setStatus('error');
            } else if (data.type === 'closed') {
              setStatus('closed');
            }
          } catch (err) {
            console.error('Error handling WS message:', err);
          }
        };

        ws.onerror = (err) => {
          console.error('WebSocket connection error:', err);
          if (isMounted) {
            setErrorMessage('Could not establish real-time voice connection. Please check network/API credentials.');
            setStatus('error');
          }
        };

        ws.onclose = () => {
          if (isMounted && status !== 'error') {
            setStatus('closed');
          }
        };
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to initialize microphone or connection.');
          setStatus('error');
        }
      }
    }

    initLiveSession();

    return () => {
      isMounted = false;
      cleanupResources();
    };
  }, []);

  // Capture Microphone Audio at 16kHz
  const startMicrophone = async (ws: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputAudioCtx;

      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        if (micMuted) return;

        const float32Data = e.inputBuffer.getChannelData(0);
        const base64PCM = float32ToBase64PCM(float32Data);

        ws.send(JSON.stringify({ audio: base64PCM }));
      };
    } catch (err: any) {
      console.error('Microphone access denied or error:', err);
      setErrorMessage('Microphone access denied. Please allow microphone permissions in browser settings.');
      setStatus('error');
    }
  };

  // Playback Output PCM Audio Chunk (24kHz)
  const playAudioChunk = (base64PCM: string) => {
    const ctx = outputAudioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const float32Data = base64PCMToFloat32(base64PCM);
    const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    if (nextStartTimeRef.current < now) {
      nextStartTimeRef.current = now;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;

    activeAudioSourcesRef.current.push(source);
    source.onended = () => {
      activeAudioSourcesRef.current = activeAudioSourcesRef.current.filter((s) => s !== source);
    };
  };

  // Stop current active speech playback
  const stopAllAudioPlayback = () => {
    activeAudioSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (_) {}
    });
    activeAudioSourcesRef.current = [];
    nextStartTimeRef.current = 0;
  };

  // Cleanup Media & WebSockets
  const cleanupResources = () => {
    stopAllAudioPlayback();

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // Send Text Question over Live WS
  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ text: textInput.trim() }));
    setLiveTranscript((prev) => (prev ? `${prev}\n\n[You]: ${textInput.trim()}` : `[You]: ${textInput.trim()}`));
    setTextInput('');
  };

  const toggleMute = () => {
    setMicMuted((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B18]/85 backdrop-blur-md">
      <div className="bg-[#050B18] border border-[#D4AF37]/50 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
        {/* Close Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tag */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9933] animate-pulse" />
          <span>आवाज़ में ज्योतिष परामर्श</span>
        </div>

        <div>
          <h3 className="text-2xl font-serif font-bold text-[#D4AF37]">
            राजन कैथवास (मंटू)
          </h3>
          <p className="text-xs text-white/70 mt-1">
            आवाज़ में सीधा ज्योतिष परामर्श एवं समाधान
          </p>
        </div>

        {/* Pulsing Visualizer Circle */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          {/* Animated Glow Rings */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-700 ${
              status === 'speaking'
                ? 'bg-gradient-to-r from-[#D4AF37]/40 via-[#FF9933]/30 to-[#B8860B]/40 animate-ping'
                : status === 'listening' && !micMuted
                ? 'bg-emerald-500/20 animate-pulse'
                : 'bg-[#D4AF37]/10'
            }`}
          />
          <div
            className={`absolute inset-3 rounded-full transition-all duration-500 border ${
              status === 'speaking'
                ? 'border-[#D4AF37] scale-105'
                : 'border-white/10'
            }`}
          />

          <button
            onClick={toggleMute}
            disabled={status === 'connecting' || status === 'error'}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
              status === 'speaking'
                ? 'bg-gradient-to-tr from-[#D4AF37] via-[#FF9933] to-[#B8860B] text-[#050B18] scale-110 shadow-[#D4AF37]/50'
                : status === 'listening'
                ? micMuted
                  ? 'bg-rose-600/80 text-white'
                  : 'bg-emerald-600 text-white'
                : 'bg-white/10 text-white'
            }`}
          >
            {status === 'connecting' ? (
              <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
            ) : status === 'speaking' ? (
              <Volume2 className="w-10 h-10 animate-pulse text-[#050B18]" />
            ) : micMuted ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white animate-bounce" />
            )}
          </button>
        </div>

        {/* Real-time Status Badge */}
        <div className="flex items-center justify-center space-x-2 text-xs font-medium">
          {status === 'connecting' && (
            <span className="text-[#D4AF37] flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              जुड़ रहा है...
            </span>
          )}
          {status === 'listening' && (
            <span className={micMuted ? 'text-rose-400' : 'text-emerald-400 flex items-center gap-1.5'}>
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              {micMuted ? 'माइक बंद है (चालू करने के लिए क्लिक करें)' : 'सुन रहा हूँ... बोलिए'}
            </span>
          )}
          {status === 'speaking' && (
            <span className="text-[#D4AF37] flex items-center gap-1.5 font-bold">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              उत्तर दे रहा हूँ...
            </span>
          )}
          {status === 'error' && (
            <span className="text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              कनेक्शन समस्या, कृपया पुनः प्रयास करें
            </span>
          )}
          {status === 'closed' && (
            <span className="text-white/50">बातचीत समाप्त हो गई</span>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Live Conversation Transcript Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 leading-relaxed max-h-40 overflow-y-auto text-left space-y-2">
          {liveTranscript ? (
            <CleanFormattedText content={liveTranscript} />
          ) : (
            <p className="text-white/50 text-center py-2">
              माइक्रोफ़ोन में बोलें या अपना प्रश्न टाइप करें। राजन कैथवास (मंटू) सीधे आवाज़ में उत्तर देंगे।
            </p>
          )}
        </div>

        {/* Optional Text Question Input */}
        <form onSubmit={handleSendText} className="flex items-center space-x-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="अपना प्रश्न यहाँ टाइप करें..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || status === 'connecting'}
            className="p-2 rounded-xl bg-[#D4AF37] text-[#050B18] font-bold hover:bg-[#FF9933] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Question Chips */}
        <div className="flex flex-wrap justify-center gap-2 text-[11px]">
          <button
            onClick={() => {
              setTextInput('मेरी कुण्डली के अनुसार विवाह का शुभ मुहूर्त कब है?');
            }}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 cursor-pointer transition-colors"
          >
            💍 विवाह मुहूर्त
          </button>
          <button
            onClick={() => {
              setTextInput('व्यापार एवं नौकरी में उन्नति के लिए शुभ उपाय बताएं।');
            }}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 cursor-pointer transition-colors"
          >
            💼 करियर एवं व्यापार उपाय
          </button>
          <button
            onClick={() => {
              setTextInput('आज का ग्रह गोचर एवं चंद्र स्थिति कैसी है?');
            }}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 cursor-pointer transition-colors"
          >
            🌙 नक्षत्र एवं ग्रह गोचर
          </button>
        </div>
      </div>
    </div>
  );
};
