const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getAIDecision = async (patientData, hospitals) => {
  // 🚨 Groq completely decommissioned ALL Vision models yesterday.
  // To prevent the app from instantly crashing, we force Groq's absolute best TEXT model (70b)
  // and process the rich textual 'context' the user manually typed in the chatbot instead.
  const modelName = "llama-3.3-70b-versatile";

  let userContent = `
      Patient Data & Symptoms:
      ${JSON.stringify({ ...patientData, scene_image: undefined }, null, 2)}

      Available Hospitals with distances:
      ${JSON.stringify(hospitals, null, 2)}

      CRITICAL: The user's primary language is ${patientData.language || "English"}.
      You MUST output the "reasoning", "first_aid", and "rejected_hospitals[].reason" text ENTIRELY in ${patientData.language || "English"}.

      Select the best hospital for this patient based on the data and the text description provided.
    `;

  const completion = await groq.chat.completions.create({
    model: modelName,
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
            "first_aid": [
              "step 1: detailed immediate critical action", 
              "step 2: substantial care instruction", 
              "step 3: further stabilization measure", 
              "step 4: what NOT to do", 
              "step 5: monitoring instruction"
            ],
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
        content: userContent,
      },
    ],
    temperature: 0.3,
  });

  const text = completion.choices[0].message.content;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

module.exports = { getAIDecision };