import React, { useState, useEffect, useRef } from 'react';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const TriageChatbot = ({ onSubmit, loading, predictionResult }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age:           '',
    heartRate:     '',
    bloodPressure: '',
    injuryType:    '',
    spo2:          '',
  });
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello. I'm the AI Triage Assistant. What is the patient's age? (Or describe everything at once: e.g., 'age 70, heart rate 120, bp low, cardiac')"
    }
  ]);
  const [inputValue, setInputValue]     = useState('');
  const [sceneImage, setSceneImage]     = useState(null);
  const [showCamera, setShowCamera]     = useState(false);
  const [speechLang, setSpeechLang]     = useState('en-IN');
  const messagesEndRef                  = useRef(null);
  const videoRef                        = useRef(null);
  const mediaStreamRef                  = useRef(null);
  const recognitionRef                  = useRef(null);
  const handleVoiceSubmitRef            = useRef(null);
  const lastProcessedResultRef          = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    speech.lang = speechLang;
    const requestedVoice = voices.find(v => v.lang === speechLang) || voices.find(v => v.lang.startsWith(speechLang.split('-')[0]));
    if (requestedVoice) speech.voice = requestedVoice;
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
  };

  // Extract InjuryType from free text — maps to valid ML labels
  const extractInjuryType = (text = '') => {
    const t = text.toLowerCase();
    if (t.includes('burn')) return 'Burn';
    if (t.includes('cardiac') || t.includes('chest') || /\bheart\b(?!\s*-?\s*rate)/.test(t)) return 'Cardiac';
    if (t.includes('fracture') || t.includes('bone') || t.includes('break')) return 'Fracture';
    if (t.includes('trauma') || t.includes('accident') || t.includes('crash')) return 'Trauma';
    return 'None';
  };

  // Extract BP from free text
  const extractBP = (text = '') => {
    const match = text.toLowerCase().match(/\b(low|normal|high)\b/i);
    return match ? match[1].toLowerCase() : 'normal';
  };

  // Build and submit clean payload to App.js handlePredict
  const submitToEngine = (data, context = '') => {
    const payload = {
      age:           parseInt(data.age)       || 30,
      heartRate:     parseInt(data.heartRate) || 80,
      SpO2:          parseFloat(data.spo2)    || 98,
      Temperature:   98.6,
      bloodPressure: data.bloodPressure       || 'normal',
      BP_Risk:       (data.bloodPressure || 'normal').charAt(0).toUpperCase()
                       + (data.bloodPressure || 'normal').slice(1),
      InjuryType:    extractInjuryType(
                       data.injuryType + ' ' + context
                     ),
      ChestPain:     (data.injuryType + ' ' + context)
                       .toLowerCase().includes('chest') ? 1 : 0,
      Unconscious:   (data.injuryType + ' ' + context)
                       .toLowerCase().includes('unconscious') ? 1 : 0,
      Diabetes:      (data.injuryType + ' ' + context)
                       .toLowerCase().includes('diabetes') ? 1 : 0,
      context,
      scene_image:   sceneImage || null,
      language:      speechLang === 'hi-IN' ? 'Hindi' : speechLang === 'mr-IN' ? 'Marathi' : 'English'
    };

    console.log('📤 Submitting to engine:', payload);
    onSubmit(payload);
  };

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Keep voice ref fresh ───────────────────────────────────────────────────
  useEffect(() => {
    handleVoiceSubmitRef.current = handleVoiceSubmit;
  });

  // ── Speech recognition setup ───────────────────────────────────────────────
  useEffect(() => {
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang        = 'en-IN';
    recognitionRef.current.continuous  = false;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessages(prev => [...prev, { sender: 'user', text: transcript }]);
      setInputValue('');
      setTimeout(() => handleVoiceSubmitRef.current(transcript), 500);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access.');
      }
    };
  }, []);

  // ── Start listening with dynamic language ──────────────────────────────────
  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLang;
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Microphone already active or blocked:", err);
      }
    }
  };

  // ── Show triage result in chat ─────────────────────────────────────────────
  useEffect(() => {
    if (!predictionResult) return;

    const resultKey = `${predictionResult.level}-${predictionResult.explanation}`;
    if (lastProcessedResultRef.current === resultKey) return;
    lastProcessedResultRef.current = resultKey;

    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: `🚨 Triage Engine Output: ${predictionResult.level} Priority.\nReasoning: ${predictionResult.explanation}`
      }
    ]);

    speak(`Emergency level ${predictionResult.level}. ${predictionResult.explanation}`);
  }, [predictionResult]);

  // ── Voice submit ───────────────────────────────────────────────────────────
  const handleVoiceSubmit = (text) => {
    if (!text || loading) return;

    const ageMatch = text.match(/\b(\d{1,3})\b/);
    const hrMatch  = text.match(/\b(1\d{2}|2\d{2})\b/);
    const bp       = extractBP(text);
    const injury   = extractInjuryType(text);

    const data = {
      age:           ageMatch ? ageMatch[1] : '30',
      heartRate:     hrMatch  ? hrMatch[0]  : '90',
      bloodPressure: bp,
      injuryType:    injury,
      spo2:          '98',
    };

    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: `🧠 Voice detected. Extracted:\n- Age: ${data.age}\n- Heart Rate: ${data.heartRate}\n- BP: ${bp}\n- Injury: ${injury}\n\nSending to AI...`
      }
    ]);

    speak('Analyzing patient condition. Please wait.');
    submitToEngine(data, text);
  };

  // ── WebRTC Camera Capture ──────────────────────────────────────────────────
  const startWebRTC = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaStreamRef.current = stream;
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
      alert("Cannot access camera. Please check browser permissions.");
      setShowCamera(false);
    }
  };

  const stopWebRTC = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const captureWebRTC = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    let width = video.videoWidth;
    let height = video.videoHeight;
    const MAX = 400; // Reduce from 800 to 400 to optimize LLM vision patches
    if (width > height) {
      if (width > MAX) { height *= MAX / width; width = MAX; }
    } else {
      if (height > MAX) { width *= MAX / height; height = MAX; }
    }
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    setSceneImage(dataUrl);
    setMessages(prev => [...prev, { sender: 'user', text: '[📸 Scene Image Attached]' }]);
    
    stopWebRTC();
  };

  // ── Image Upload ───────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX = 400; // Reduce from 800 to 400 to optimize LLM vision patches
      if (width > height) {
        if (width > MAX) {
          height *= MAX / width;
          width = MAX;
        }
      } else {
        if (height > MAX) {
          width *= MAX / height;
          height = MAX;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setSceneImage(resizedDataUrl);
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: '[📸 Scene Image Attached]' }
      ]);
    };
    img.src = URL.createObjectURL(file);
    e.target.value = null; // allow selecting the same file again
  };

  // ── Text send (step-by-step or smart extraction) ───────────────────────────
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');

    const lowerMsg   = userMessage.toLowerCase();
    const ageMatch   = userMessage.match(/age\s*(?:is\s*)?(\d{1,3})|(\d{1,3})\s*(?:years?|yrs?|yo|old)/i);
    const age        = ageMatch ? (ageMatch[1] || ageMatch[2] || '30') : '30';
    const hrMatch    = userMessage.match(/\b(1\d{2}|2\d{2})\b/);
    const bpMatch    = lowerMsg.match(/\b(low|normal|high)\b/i);
    const injury     = extractInjuryType(userMessage);

    // ── Smart extraction: user described everything at once ──────────────────
    if (step === 1 && userMessage.length > 15 && hrMatch && bpMatch) {
      const hr = hrMatch[0];
      const bp = bpMatch[1].toLowerCase();

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `🧠 Smart AI Extraction logic engaged.\nExtracted:\n- Age: ${age}\n- Heart Rate: ${hr}\n- BP: ${bp}\n- Injury Type: ${injury}\n- Context: ${userMessage}\n\nSubmitting to Medical Decision Engine...`
        }
      ]);

      const newFormData = {
        age,
        heartRate:     hr,
        bloodPressure: bp,
        injuryType:    injury,   // ✅ mapped label, NOT raw sentence
        spo2:          '98',
      };

      setFormData(newFormData);
      setStep(6); // done
      submitToEngine(newFormData, userMessage);
      return;
    }

    // ── Step-by-step flow ────────────────────────────────────────────────────
    let newStep     = step;
    let newFormData = { ...formData };

    if (step === 1) {
      newFormData.age = age || userMessage;
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "Got it. What is the patient's heart rate? (e.g. 120)" }
      ]);
      newStep = 2;

    } else if (step === 2) {
      newFormData.heartRate = userMessage.replace(/\D/g, '') || '80';
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "What is the SpO2 level? (e.g. 95, or type 'skip' for default)" }
      ]);
      newStep = 3;

    } else if (step === 3) {
      newFormData.spo2 = lowerMsg === 'skip' ? '98' : userMessage.replace(/\D/g, '') || '98';
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "What is the blood pressure risk? (low / normal / high)" }
      ]);
      newStep = 4;

    } else if (step === 4) {
      newFormData.bloodPressure = extractBP(userMessage);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "What type of injury or emergency? (e.g. Cardiac, Trauma, Burn, Fracture, or describe symptoms)"
        }
      ]);
      newStep = 5;

    } else if (step === 5) {
      // ✅ This is where injuryType is set — map it properly
      newFormData.injuryType = injury;
      newFormData.context    = userMessage;

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `📋 Summary:\n- Age: ${newFormData.age}\n- Heart Rate: ${newFormData.heartRate}\n- SpO2: ${newFormData.spo2}\n- BP: ${newFormData.bloodPressure}\n- Injury: ${newFormData.injuryType}\n\nSubmitting to Medical Decision Engine...`
        }
      ]);

      setStep(6);
      setFormData(newFormData);
      submitToEngine(newFormData, userMessage);
      return;
    }

    setStep(newStep);
    setFormData(newFormData);
  };

  return (
    <div className="glass-panel animate-slide-up" style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      height: '450px', marginBottom: '24px'
    }}>
      {/* 📸 Built-in WebRTC Camera Modal */}
      {showCamera && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: '#000', zIndex: 50, borderRadius: '16px',
          display: 'flex', flexDirection: 'column'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ flex: 1, width: '100%', objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '16px', background: '#111', borderRadius: '0 0 16px 16px' }}>
            <button type="button" onClick={stopWebRTC} className="btn-secondary" style={{ padding: '8px 16px' }}>
              Cancel
            </button>
            <button type="button" onClick={captureWebRTC} className="btn-primary" style={{ padding: '8px 24px' }}>
              📸 Capture
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(0,0,0,0.2)',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>🤖 AI Triage Chatbot</h2>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--accent-blue)',
          background: 'rgba(59, 130, 246, 0.2)',
          padding: '4px 8px',
          borderRadius: '12px'
        }}>
          Data Extraction Active
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%'
          }}>
            <div
              className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div className="chat-bubble chat-bubble-bot animate-pulse"
              style={{ fontStyle: 'italic', opacity: 0.7 }}>
              Medical Decision Engine processing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{
        display: 'flex', gap: '8px',
        padding: '16px',
        borderTop: '1px solid var(--glass-border)'
      }}>
        <input
          type="text"
          className="input-glass"
          style={{ flex: 1 }}
          placeholder={
            step === 6
              ? 'Evaluation complete...'
              : step === 1 ? 'Enter age or describe full state...'
              : step === 2 ? 'Enter heart rate...'
              : step === 3 ? 'Enter SpO2 (or type skip)...'
              : step === 4 ? 'low / normal / high'
              : 'Describe injury or emergency type...'
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading || step === 6}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* 🌐 Speech Language Selector */}
          {SpeechRecognition && (
            <select 
              className="input-glass"
              style={{ width: '80px', padding: '0 8px', fontSize: '0.8rem', cursor: 'pointer' }}
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value)}
              title="Speech Language"
              disabled={loading || step === 6}
            >
              <option value="en-IN">English</option>
              <option value="hi-IN">हिंदी</option>
              <option value="mr-IN">मराठी</option>
            </select>
          )}

          {/* 🎤 Voice button */}
          {SpeechRecognition && (
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '12px' }}
              title="Voice Input"
              disabled={loading || step === 6}
              onClick={startListening}
            >
              🎤
            </button>
          )}

          {/* 📷 Camera button */}
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '12px' }}
            title="Open Camera"
            onClick={startWebRTC}
            disabled={loading || step === 6}
          >
            {sceneImage ? '📸' : '📷'}
          </button>

          {/* 🖼️ Gallery button */}
          <label
            className="btn-secondary"
            style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Upload from Gallery"
          >
            🖼️
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
              disabled={loading || step === 6}
            />
          </label>

          {/* Send button */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: 'auto', padding: '12px 20px' }}
            disabled={loading || step === 6 || !inputValue.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default TriageChatbot;