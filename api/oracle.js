// =====================================================================
// ARCHIVO: api/oracle.js (Versión Inteligente Multi-Modelo)
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

  if (!apiKey) {
      return res.status(200).json({
          numbers: [0, 0, 0],
          message: "ERROR: Falta la API Key en Vercel."
      });
  }

  // LISTA DE MODELOS A PROBAR (En orden de preferencia)
  // 1. El que viste en tu cuenta (2.5)
  // 2. El estándar actual (1.5-flash)
  // 3. Una variante de versión (1.5-flash-latest)
  // 4. El clásico confiable (gemini-pro)
  const CANDIDATE_MODELS = [
      "gemini-2.5-flash", 
      "gemini-1.5-flash", 
      "gemini-1.5-flash-latest", 
      "gemini-pro"
  ];

  const systemPrompt = `
    Eres "El Oráculo de la Fortuna".
    Interpreta el texto del usuario y genera 3 números de la suerte (000-999).
    Responde SOLO en JSON: { "numbers": [123, 45, 999], "message": "Texto aquí..." }
  `;

  // Función auxiliar para intentar llamar a un modelo específico
  const tryModel = async (modelName) => {
    console.log(`🔮 Intentando con modelo: ${modelName}...`);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
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
        // Si es 404, lanzamos un error especial para saber que podemos probar el siguiente
        if (response.status === 404) throw new Error("MODEL_NOT_FOUND");
        
        // Si es otro error (como 400 o 500), devolvemos el texto para debug
        const txt = await response.text();
        throw new Error(`API_ERROR: ${txt}`);
    }

    const data = await response.json();
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
  };

  // BUCLE DE INTENTOS
  let lastError = "";
  
  for (const model of CANDIDATE_MODELS) {
      try {
          const result = await tryModel(model);
          // ¡ÉXITO! Devolvemos el resultado y terminamos
          return res.status(200).json(result);
      } catch (error) {
          console.warn(`⚠️ Falló ${model}: ${error.message}`);
          lastError = error.message;
          
          // Si el error NO es "No encontrado" (ej: es un error de sintaxis), paramos y reportamos.
          // Si ES "No encontrado" (MODEL_NOT_FOUND), el bucle continúa con el siguiente modelo.
          if (error.message !== "MODEL_NOT_FOUND") {
               break; 
          }
      }
  }

  // Si llegamos aquí, fallaron todos los modelos
  console.error("❌ Todos los modelos fallaron.");
  res.status(200).json({
    numbers: [0, 0, 0],
    message: `DIAGNÓSTICO FINAL: No pudimos conectar con ningún modelo. Último error: ${lastError}`
  });
}