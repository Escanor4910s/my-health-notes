import { useState, useEffect, useRef, useCallback } from 'react';

export function useVoiceDictation({ onResult, lang = 'fr-FR' }) {
  // status: 'idle' | 'starting' | 'listening' | 'stopping'
  const [status, setStatus] = useState('idle');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  
  // Use a ref for the callback so it doesn't trigger useEffect re-runs
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    // Check support for speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setStatus('listening');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResultRef.current && (finalTranscript || interimTranscript)) {
        onResultRef.current({ finalTranscript, interimTranscript });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setStatus('idle');
    };

    recognition.onend = () => {
      setStatus('idle');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort(); // abort is safer than stop during cleanup to prevent firing onend unexpectedly
      }
    };
  }, [lang]); // Removed onResult to prevent infinite re-mounting loops

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (status === 'listening' || status === 'starting') {
      setStatus('stopping');
      recognitionRef.current.stop();
    } else {
      try {
        setStatus('starting');
        recognitionRef.current.start();
      } catch (e) {
        console.error("Error starting speech recognition", e);
        setStatus('idle');
      }
    }
  }, [status]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && (status === 'listening' || status === 'starting')) {
      setStatus('stopping');
      recognitionRef.current.stop();
    }
  }, [status]);

  return {
    status,
    isListening: status === 'listening',
    isSupported,
    toggleListening,
    stopListening
  };
}
