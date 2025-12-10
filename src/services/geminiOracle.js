// src/services/geminiOracle.js

// ⚠️ PEGA AQUÍ LA URL QUE TE DIO CLOUDFLARE AL PUBLICAR EL WORKER
const WORKER_URL = "https://oraculo-rifa.resumenia.workers.dev/"; 

export const callGeminiOracle = async (userContext) => {
  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: userContext // Enviamos lo que escribió el usuario
      })
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    
    // El worker ya nos devuelve la estructura exacta { numbers: [], message: "" }
    return data;

  } catch (error) {
    console.error("Error conectando con el Oráculo:", error);
    // Fallback de emergencia por si el Worker falla
    return {
      numbers: [111, 222, 333],
      message: "Los astros están en silencio, intenta de nuevo más tarde."
    };
  }
};