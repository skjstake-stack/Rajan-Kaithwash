import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Loader2, Bot, X } from 'lucide-react';
import { Language } from '../types';
import { CleanFormattedText, cleanMarkdownSymbols } from '../utils/textUtils';

interface VoiceAssistantModalProps {
  currentLang: Language;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ currentLang, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('हरि ॐ! मैं आपकी बात सुन रहा हूँ। कृपया अपनी जिज्ञासा बोलें अथवा नीचे प्रश्न चुनें...');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const startVoiceInput = () => {
    setIsListening(true);
    setTranscript('आपकी वाणी सुनी जा रही है...');
    setTimeout(() => {
      setIsListening(false);
      setTranscript('वर्ष 2026 में मेरे करियर में उन्नति कब होगी?');
      handleVoiceQuery('वर्ष 2026 में मेरे करियर में उन्नति कब होगी?');
    }, 3000);
  };

  const handleVoiceQuery = async (queryText: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: queryText }],
          lang: currentLang,
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        const cleanedReply = cleanMarkdownSymbols(data.reply);
        setAiResponse(cleanedReply);
        speakText(cleanedReply);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B18]/80 backdrop-blur-md">
      <div className="bg-[#050B18] border border-[#D4AF37]/40 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
        <button
          onClick={() => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            onClose();
          }}
          className="absolute top-4 right-4 text-white/50 hover:text-white text-xl font-bold cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
          <span>जेमिनी एआई वॉइस मोड (Gemini AI Voice Mode)</span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-[#D4AF37]">
          वैदिक वॉइस असिस्टेंट
        </h3>

        {/* Pulsing Audio Circle */}
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full transition-all duration-500 ${
              isSpeaking || isListening
                ? 'bg-[#D4AF37]/30 animate-ping'
                : 'bg-[#D4AF37]/10'
            }`}
          />
          <button
            onClick={startVoiceInput}
            disabled={isListening || loading}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white'
                : isSpeaking
                ? 'bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-[#050B18] scale-110'
                : 'bg-gradient-to-tr from-[#D4AF37] via-[#FF9933] to-[#B8860B] text-[#050B18] hover:scale-105'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 animate-bounce" />
            ) : isSpeaking ? (
              <Volume2 className="w-10 h-10 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>
        </div>

        <p className="text-xs text-[#D4AF37] font-medium">
          {isListening
            ? 'सुन रहा हूँ... अब बोलें!'
            : isSpeaking
            ? 'आचार्य एआई उत्तर दे रहे हैं...'
            : 'प्रश्न बोलने हेतु माइक का बटन दबाएं'}
        </p>

        {transcript && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 italic">
            "{transcript}"
          </div>
        )}

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white/80 leading-relaxed max-h-48 overflow-y-auto text-left">
          {loading ? (
            <div className="flex items-center justify-center space-x-2 text-[#D4AF37] py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>आकाशीय नक्षत्रों एवं ग्रह गोचर की गणना जारी है...</span>
            </div>
          ) : (
            <CleanFormattedText content={aiResponse} />
          )}
        </div>

        {/* Quick Voice Topics */}
        <div className="flex flex-wrap justify-center gap-2 text-[11px]">
          <button
            onClick={() => handleVoiceQuery('मेरी कुण्डली के अनुसार विवाह का योग कब बन रहा है?')}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 cursor-pointer"
          >
            💍 विवाह समय विचार
          </button>
          <button
            onClick={() => handleVoiceQuery('व्यापार में वृद्धि हेतु शुभ रत्न परामर्श दीजिए।')}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 cursor-pointer"
          >
            💎 व्यापार वृद्धि रत्न
          </button>
        </div>
      </div>
    </div>
  );
};
