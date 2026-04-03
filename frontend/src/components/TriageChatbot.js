import React, { useState, useEffect, useRef } from 'react';

const TriageChatbot = ({ onSubmit, loading, predictionResult }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    heartRate: '',
    bloodPressure: '',
    injuryType: ''
  });
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello. I'm the AI Triage Assistant. What is the patient's age? (Or describe everything at once: e.g., '10 years old, heart rate 140, bp low')" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sceneImage, setSceneImage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (predictionResult) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: `🚨 Triage Engine Output: ${predictionResult.level} Priority.\nReasoning: ${predictionResult.explanation}` 
      }]);
    }
  }, [predictionResult]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');

    const lowerMsg = userMessage.toLowerCase();
    
    // SMART EXTRACTION (NLP logic mockup)
    const ageMatch = userMessage.match(/\b(\d{1,3})\s*(years?|yrs?|yo|old|age)\b/i);
    const hrMatch = userMessage.match(/\b(1\d{2}|[5-9]\d|2\d{2})\b/);
    const bpMatch = lowerMsg.match(/\b(low|normal|high)\b/i);
    
    // If user provided a complex statement
    if (step === 1 && userMessage.length > 15 && hrMatch && bpMatch) {
      const hr = hrMatch[0];
      const bp = bpMatch[1].toLowerCase();
      const age = ageMatch ? ageMatch[1] : '30';
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: `🧠 Smart AI Extraction logic engaged.\nExtracted:\n- Age: ${age}\n- Heart Rate: ${hr}\n- BP: ${bp}\n- Context: ${userMessage}\n\nSubmitting to Medical Decision Engine...` 
      }]);
      
      const newFormData = { age, heartRate: hr, bloodPressure: bp, injuryType: userMessage };
      setFormData(newFormData);
      setStep(5);
      onSubmit({ ...newFormData, scene_image: sceneImage });
      return;
    }

    let newStep = step;
    let newFormData = { ...formData };

    if (step === 1) {
      newFormData.age = userMessage;
      setMessages(prev => [...prev, { sender: 'bot', text: "Got it. What is the patient's heart rate?" }]);
      newStep = 2;
    } else if (step === 2) {
      newFormData.heartRate = userMessage;
      setMessages(prev => [...prev, { sender: 'bot', text: "And what is the blood pressure? (Please type: low, normal, or high)" }]);
      newStep = 3;
    } else if (step === 3) {
      if (['low', 'normal', 'high'].includes(lowerMsg)) {
        newFormData.bloodPressure = lowerMsg;
        setMessages(prev => [...prev, { sender: 'bot', text: "Understood. Finally, what is the type of injury or primary symptom?" }]);
        newStep = 4;
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: "Please enter a valid blood pressure category (low, normal, or high)." }]);
      }
    } else if (step === 4) {
      newFormData.injuryType = userMessage;
      setMessages(prev => [...prev, { sender: 'bot', text: "Thank you. Submitting patient data to Medical Decision Engine..." }]);
      newStep = 5;
      onSubmit({ ...newFormData, scene_image: sceneImage });
    } 

    setStep(newStep);
    setFormData(newFormData);
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '450px', marginBottom: '24px' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>🤖 AI Triage Chatbot</h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '12px' }}>Data Extraction Active</span>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%'
          }}>
            <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`} style={{ whiteSpace: 'pre-wrap' }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div className="chat-bubble chat-bubble-bot animate-pulse" style={{ fontStyle: 'italic', opacity: 0.7 }}>
              Medical Decision Engine processing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', padding: '16px', borderTop: '1px solid var(--glass-border)' }}>
        <input
          type="text"
          className="input-glass"
          style={{ flex: 1 }}
          placeholder={step === 5 ? "Evaluation complete..." : "Type your answer (or describe full state)..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading || step === 5}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <label 
            className="btn-secondary" 
            style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Take Photo of Scene"
          >
            📷
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setSceneImage(reader.result);
                    setMessages(prev => [...prev, { sender: 'user', text: '[📸 Scene Image Attached]' }]);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              disabled={loading || step === 5}
            />
          </label>
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: 'auto', padding: '12px 20px' }}
            disabled={loading || step === 5 || (!inputValue.trim() && step !== 5)}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default TriageChatbot;
