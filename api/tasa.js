// Nombre del archivo: api/tasa.js

export default async function handler(req, res) {
  const API_URL = 'https://api.dolarvzla.com/public/exchange-rate';

  try {
    // Agregamos headers para evitar el bloqueo (User-Agent es clave)
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`La API externa respondió con estado: ${response.status}`);
    }

    const data = await response.json();

    // Devolvemos el JSON tal cual lo recibimos (o procesado si prefieres)
    // Aquí lo devuelvo limpio para que tu frontend lo consuma
    return res.status(200).json({
      success: true,
      source: "API Oficial",
      data: data
    });

  } catch (error) {
    console.error('Error fetching tasa:', error);

    // Fallback de emergencia (usa los datos manuales si falla la API)
    return res.status(500).json({
      success: false,
      source: "Manual (Emergencia) - Falló la conexión.",
      error: error.message,
      rates: { usd: 65, eur: 0 } // Tus valores de emergencia actuales
    });
  }
}