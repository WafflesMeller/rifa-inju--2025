// =====================================================================
// ARCHIVO: api/oracle.js
// =====================================================================

export default async function handler(req, res) {
  // Configuración CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { userContext } = req.body || {};
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  // Prompt del sistema
  const systemPrompt = `
    Eres "El Oráculo de la Fortuna", un numerólogo místico.
    Tu objetivo es interpretar el texto del usuario y generar 3 números de la suerte (000-999).
    Responde SOLO en JSON: { "numbers": [123, 45, 999], "message": "Texto aquí..." }
  `;

  try {
    // NOTA: Usamos el modelo que sale en tu captura. 
    // Si falla, prueba cambiarlo a "gemini-1.5-flash" que es el estándar global.
    const MODEL_NAME = "gemini-2.5-flash"; 

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Contexto: "${userContext}". Dame mis números.` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Devolvemos la respuesta limpia al Frontend
    res.status(200).json(JSON.parse(resultText));

  } catch (error) {
    console.error("❌ Error Oracle:", error.message);
    // Respuesta de respaldo si Google falla
    res.status(200).json({
      numbers: [777, 111, 333],
      message: "La conexión mística falló, pero el destino te regala estos números."
    });
  }
}