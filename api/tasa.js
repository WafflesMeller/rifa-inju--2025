// =====================================================================
// ARCHIVO: api/tasa.js (Vía DolarApi.com)
// =====================================================================

export default async function handler(req, res) {
    // 1. Configuración CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // TASA MANUAL DE SEGURIDAD (Actualízala si todo lo demás falla)
    const TASA_MANUAL = 64.50; 

    try {
        console.log("🔄 Consultando DolarApi.com...");

        // 2. Consultamos la API pública de DolarApi (Fuente Oficial BCV)
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // La API devuelve: { "promedio": 64.25, "fechaActualizacion": "..." }
        let tasa = data.promedio;

        console.log("✅ Tasa recibida:", tasa);

        // Validación de seguridad
        if (!tasa || tasa === 0) {
            console.warn("⚠️ API devolvió 0. Usando manual.");
            tasa = TASA_MANUAL;
        }

        // 3. Respuesta
        res.status(200).json({
            success: true,
            source: 'DolarApi (BCV)',
            fecha: data.fechaActualizacion || new Date().toISOString(),
            rates: {
                usd: parseFloat(tasa),
                eur: 0
            }
        });

    } catch (error) {
        console.error("❌ Error API:", error.message);
        
        // 4. FALLBACK FINAL: Si DolarApi se cae, usamos la manual
        res.status(200).json({ 
            success: true, 
            source: 'Manual (Emergencia)',
            rates: {
                usd: TASA_MANUAL,
                eur: 0
            }
        });
    }
}