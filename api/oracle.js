// =====================================================================
// ARCHIVO: api/oracle.js (Versión Directa - Un solo modelo)
// =====================================================================

export default async function handler(req, res) {
  // 1. Configuración CORS (Permisos para que Vercel hable con tu frontend)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Obtener datos y API Key
  const { userContext } = req.body || {};
  const apiKey = process.env.VITE_GEMINI_API_KEY; // O process.env.GEMINI_API_KEY según como la llamaste en Vercel

  if (!apiKey) {
      console.error("❌ Error: No se encontró la API KEY.");
      return res.status(500).json({
          numbers: [0, 0, 0],
          message: "ERROR CONFIG: Falta la API Key en las variables de entorno."
      });
  }

  // =================================================================
  // 3. CONFIGURACIÓN DEL MODELO ÚNICO
  // Si en AI Studio viste otro nombre, CÁMBIALO AQUÍ.
  // Ejemplos válidos: "gemini-1.5-flash", "gemini-2.0-flash-exp"
  // =================================================================
  const MODEL_NAME = "gemini-2.5-flash"; 

  const systemPrompt = `
    Eres "El Oráculo de la Fortuna".
    Interpreta el texto del usuario y genera 3 números de la suerte (000-999).
    Responde SOLO en JSON: { "numbers": [123, 45, 999], "message": "Texto aquí..." }
  `;

  try {
    console.log(`🔮 Consultando al oráculo usando modelo: ${MODEL_NAME}...`);

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

    // 4. Manejo de Errores de la API
    if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ Error en la API de Google (${response.status}):`, errorData);
        throw new Error(`Google API Error: ${response.status} - ${errorData}`);
    }

    // 5. Procesar Respuesta
    const data = await response.json();
    
    // Extraemos el texto JSON que devuelve la IA
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
        throw new Error("La IA no devolvió ningún texto.");
    }

    const result = JSON.parse(aiText);
    
    // Enviamos la respuesta limpia al frontend
    return res.status(200).json(result);

  } catch (error) {
      console.error("💥 Error General:", error.message);
      return res.status(200).json({
        numbers: [0, 0, 0],
        message: `Error del Oráculo: ${error.message}`
      });
  }
}