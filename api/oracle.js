// =====================================================================
// ARCHIVO: api/oracle.js (Modo Diagnóstico)
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
  
  // 1. Verificamos si la API Key existe en Vercel
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
      return res.status(200).json({
          numbers: [0, 0, 0],
          message: "ERROR TÉCNICO: No se encontró la API KEY en las variables de Vercel."
      });
  }

  const systemPrompt = `
    Eres "El Oráculo de la Fortuna".
    Tu objetivo es interpretar el texto del usuario y generar 3 números de la suerte (000-999).
    Responde SOLO en JSON: { "numbers": [123, 45, 999], "message": "Texto aquí..." }
  `;

  try {
    // 2. CAMBIO IMPORTANTE: Usamos el modelo ESTÁNDAR (1.5) para descartar errores de versión
    // Si esto funciona, luego podemos intentar volver al 2.5
    const MODEL_NAME = "gemini-1.5-flash"; 

    console.log(`🔮 Consultando modelo: ${MODEL_NAME}...`);

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
        // Leemos el error exacto que manda Google
        const errorText = await response.text();
        throw new Error(`Google Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    res.status(200).json(JSON.parse(resultText));

  } catch (error) {
    console.error("❌ Error Oracle:", error.message);
    
    // 3. MODO CHISMOSO: Devolvemos el error real al usuario para que lo leas
    res.status(200).json({
      numbers: [0, 0, 0],
      message: `DIAGNÓSTICO: ${error.message}` // <--- Aquí verás el error real
    });
  }
}