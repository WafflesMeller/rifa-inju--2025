// src/services/geminiOracle.js

export const callGeminiOracle = async (userContext) => {
  const apiKey = ""; // Se inyecta en tiempo de ejecución
  const systemPrompt = `
    Eres "El Oráculo de la Fortuna", un numerólogo místico y experto en azar para una rifa de una moto.
    Tu objetivo es interpretar el texto del usuario (un sueño, una fecha, un sentimiento) y generar 3 "Números de la Suerte" (entre 000 y 999).
    
    Reglas:
    1. Analiza el texto del usuario buscando simbolismos.
    2. Genera exactamente 3 números enteros únicos entre 0 y 999.
    3. Escribe una predicción corta, mística y divertida explicando por qué elegiste esos números.
    4. Responde ÚNICAMENTE en formato JSON válido.
    
    Formato de respuesta JSON esperado:
    {
      "numbers": [123, 45, 999],
      "message": "Tu sueño de volar indica altura (999) y libertad..."
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Contexto del usuario: "${userContext}". Dame mis números de la suerte.` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    if (!response.ok) throw new Error('Error conectando con el Oráculo');
    
    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Error en Gemini:", error);
    return null;
  }
};
