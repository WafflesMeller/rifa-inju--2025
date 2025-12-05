// =====================================================================
// ARCHIVO: api/tasa.js (Versión "API Community")
// =====================================================================
// Ya no necesitas 'cheerio' ni 'https agent'. Solo fetch nativo.

export default async function handler(req, res) {
    // 1. CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        console.log("🔄 Consultando API PyDolarVenezuela...");

        // Esta API unifica BCV, EnParalelo, ExchangeMonitor, etc.
        // Endpoint oficial del proyecto
        const response = await fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar/page?page=bcv');
        
        if (!response.ok) {
            throw new Error(`API Community falló: ${response.status}`);
        }

        const data = await response.json();
        
        // La estructura de esta API suele ser:
        // {
        //   "monitors": {
        //      "usd": { "price": 45.50, ... },
        //      "eur": { "price": 48.20, ... }
        //   }
        // }
        
        // NOTA: La estructura exacta puede variar ligeramente, pero suele traer USD y EUR.
        // Si usamos el endpoint ?page=bcv, trae los datos oficiales.

        const tasaDolar = data.monitors.usd.price || 0;
        const tasaEuro  = data.monitors.eur.price || 0;
        const fechaData = data.datetime?.date || new Date().toISOString();

        console.log(`✅ Datos recibidos: USD ${tasaDolar} | EUR ${tasaEuro}`);

        res.status(200).json({
            success: true,
            source: 'API Community (BCV)', // O ExchangeMonitor si cambias el parámetro
            fecha: fechaData,
            rates: {
                usd: tasaDolar,
                eur: tasaEuro
            }
        });

    } catch (error) {
        console.error("❌ Error Principal:", error.message);
        
        // =========================================
        // PLAN B: FALLBACK ROBUSTO (Tu código anterior o Manual)
        // =========================================
        res.status(200).json({
            success: true,
            source: 'Manual (Emergencia)',
            warning: true,
            rates: { 
                usd: 65.00, // Ajusta esto manualmente si todo explota
                eur: 68.00 
            }
        });
    }
}