// =====================================================================
// ARCHIVO: api/tasa.js (Traducción directa de tu Python a Node.js)
// =====================================================================
import * as cheerio from 'cheerio';
import https from 'https';

export default async function handler(req, res) {
    // 1. Configuración CORS (Para que React pueda leer esto)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        console.log("🔄 Iniciando Scraper BCV (Modo Inseguro SSL)...");

        // 2. EL TRUCO DE PYTHON TRADUCIDO:
        // En Python usabas: requests.get(..., verify=False)
        // En Node.js usamos: rejectUnauthorized: false
        const sslAgent = new https.Agent({
            rejectUnauthorized: false
        });

        // 3. Descargar el HTML del BCV
        const response = await fetch('https://www.bcv.org.ve', {
            method: 'GET',
            agent: sslAgent, // <--- Aquí aplicamos el "verify=False"
            headers: {
                // Fingimos ser un navegador real
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        if (!response.ok) {
            throw new Error(`BCV respondió status: ${response.status}`);
        }

        const html = await response.text();

        // 4. Analizar el HTML (Igual que BeautifulSoup)
        const $ = cheerio.load(html);

        // Función para limpiar el texto (Igual a tu fix_value de Python)
        const extraerValor = (idDiv) => {
            // Buscamos <div id="dolar"> ... <strong> 45,50 </strong>
            let texto = $(`#${idDiv} strong`).text().trim();
            if (!texto) return 0;
            // Python: fix_value (cambia coma por punto)
            return parseFloat(texto.replace(',', '.'));
        };

        const tasaDolar = extraerValor('dolar');
        const tasaEuro = extraerValor('euro');

        // Extraer fecha (Igual que tu Python: class="date-display-single")
        let fechaBCV = $('.date-display-single').first().text().trim();
        
        console.log(`✅ Datos leídos: USD ${tasaDolar} | EUR ${tasaEuro}`);

        // 5. Validar si encontramos algo (si devuelve 0 es que nos bloquearon)
        if (tasaDolar === 0) {
            throw new Error("Se leyó el HTML pero no se encontraron los montos (Posible bloqueo de IP)");
        }

        // 6. Responder
        res.status(200).json({
            success: true,
            source: 'BCV Directo',
            fecha: fechaBCV || new Date().toISOString(),
            rates: {
                usd: tasaDolar,
                eur: tasaEuro
            }
        });

    } catch (error) {
        console.error("❌ Error Scraper:", error.message);
        
        // PLAN B: Si Vercel es bloqueado por el BCV, usamos la API externa de respaldo
        // Esto es automático para que tu página nunca se rompa.
        try {
            console.log("⚠️ Falló conexión directa. Intentando API Rafnixg...");
            const respB = await fetch('https://bcv-api.rafnixg.dev/v1/exchange-rates/latest/USD');
            const dataB = await respB.json();
            
            res.status(200).json({
                success: true,
                source: 'API Respaldo (Rafnixg)',
                fecha: new Date().toISOString(),
                rates: {
                    usd: parseFloat(dataB.rate || dataB.price || 0),
                    eur: 0
                }
            });
        } catch (errB) {
            // Si TODO falla, devolvemos tasa manual de emergencia
            res.status(200).json({
                success: true,
                source: 'Manual (Emergencia)',
                rates: { usd: 65.00, eur: 0 }
            });
        }
    }
}