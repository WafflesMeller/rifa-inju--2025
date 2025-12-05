// =====================================================================
// ARCHIVO: api/tasa.js (Versión API Rafnixg)
// =====================================================================

export default async function handler(req, res) {
    // 1. Configuración CORS (Igual que antes)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // 2. Consultamos la API externa (Rafnixg)
        const response = await fetch('https://bcv-api.rafnixg.dev/v1/exchange-rates/latest/USD');
        
        if (!response.ok) {
            throw new Error(`Error API externa: ${response.status}`);
        }

        const apiData = await response.json();
        
        // LOG para que veas en Vercel qué respondió la API exactamente
        console.log("✅ Respuesta API BCV:", apiData);

        // 3. Adaptamos la respuesta al formato que usa tu Frontend
        // La API de Rafnixg suele devolver algo como: { "rate": 64.25, ... }
        // Aseguramos que 'rate' exista, si no, lanzamos error.
        
        const tasaDolar = apiData.rate || apiData.price || 0;

        if (!tasaDolar || tasaDolar === 0) {
            throw new Error('La API no devolvió una tasa válida');
        }

        // 4. Respondemos a tu página web
        res.status(200).json({
            success: true,
            fecha: new Date().toISOString(),
            rates: {
                usd: parseFloat(tasaDolar),
                // Si quisieras Euro, tendrías que hacer otro fetch a /latest/EUR
                // Por ahora lo dejamos igual al dólar o en 0 para no romper
                eur: 0 
            }
        });

    } catch (error) {
        console.error("❌ Error obteniendo tasa:", error);
        res.status(500).json({ 
            success: false, 
            error: 'No se pudo obtener la tasa del día' 
        });
    }
}