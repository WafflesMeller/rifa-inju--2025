// src/services/geminiOracle.js

export const callGeminiOracle = async (userContext) => {
  try {
    // Llamamos a NUESTRA propia API en Vercel
    // Esto evita el bloqueo de Venezuela
    const response = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userContext }),
    });

    if (!response.ok) throw new Error('Error en el servidor');

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error:", error);
    return {
      numbers: [123, 456, 789],
      message: "El oráculo está descansando. Intenta de nuevo."
    };
  }
};