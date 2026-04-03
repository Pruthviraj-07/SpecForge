const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getAIDecision = async (patientData, hospitals) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
          You are an emergency medical triage and hospital
          routing AI for Indian hospitals.
          Given patient vitals and hospital availability data,
          you must:
          1. Predict severity and care needs
          2. Select the best hospital
          3. Explain your decision clearly

          Always respond in this exact JSON format only,
          no extra text, no markdown backticks:
          {
            "severity": "Critical/Moderate/Mild",
            "icu_needed": true/false,
            "ventilator_needed": true/false,
            "specialist": "cardiologist/neurologist/orthopedic/none",
            "best_hospital": "exact hospital name",
            "eta_minutes": number,
            "reasoning": "clear explanation in 2-3 sentences",
            "rejected_hospitals": [
              {
                "name": "hospital name",
                "reason": "why rejected"
              }
            ]
          }
        `,
      },
      {
        role: "user",
        content: `
          Patient Data:
          ${JSON.stringify(patientData, null, 2)}

          Available Hospitals with distances:
          ${JSON.stringify(hospitals, null, 2)}

          Select the best hospital for this patient.
        `,
      },
    ],
    temperature: 0.3,
  });

  const text = completion.choices[0].message.content;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

module.exports = { getAIDecision };