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
  const messagesEndRef                  = useRef(null);
  const recognitionRef                  = useRef(null);
  const handleVoiceSubmitRef            = useRef(null);
  const lastProcessedResultRef          = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang === 'en-IN');
    if (indianVoice) speech.voice = indianVoice;
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
  };

  // Extract InjuryType from free text — maps to valid ML labels
  const extractInjuryType = (text = '') => {
    const t = text.toLowerCase();
    if (t.includes('burn'))                                           return 'Burn';
    if (t.includes('cardiac') || t.includes('heart') ||
        t.includes('chest'))                                          return 'Cardiac';
    if (t.includes('fracture') || t.includes('bone') ||
        t.includes('break'))                                          return 'Fracture';
    if (t.includes('trauma') || t.includes('accident') ||
        t.includes('crash'))                                          return 'Trauma';
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
      display: 'flex', flexDirection: 'column',
      height: '450px', marginBottom: '24px'
    }}>
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
          {/* 🎤 Voice button */}
          {SpeechRecognition && (
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '12px' }}
              title="Voice Input"
              disabled={loading || step === 6}
              onClick={() => recognitionRef.current?.start()}
            >
              🎤
            </button>
          )}

          {/* 📷 Camera button */}
          <label
            className="btn-secondary"
            style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Take Photo of Scene"
          >
            {sceneImage ? '📸' : '📷'}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                  setSceneImage(reader.result);
                  setMessages(prev => [
                    ...prev,
                    { sender: 'user', text: '[📸 Scene Image Attached]' }
                  ]);
                };
                reader.readAsDataURL(file);
              }}
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