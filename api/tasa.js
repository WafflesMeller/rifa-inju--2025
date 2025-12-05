// =====================================================================
// ARCHIVO: api/tasa.js (Versión Scraper Directo BCV - Tipo Python)
// =====================================================================
import * as cheerio from 'cheerio';
import https from 'https';

export default async function handler(req, res) {
    // 1. Configuración CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // 2. TRUCO SSL: Creamos un agente que ignora errores de certificado
        // Esto es el equivalente a "verify=False" en tu script de Python
        const sslAgent = new https.Agent({
            rejectUnauthorized: false
        });

        // 3. Hacemos la petición directa al BCV
        const response = await fetch('https://www.bcv.org.ve', {
            method: 'GET',
            agent: sslAgent, // Usamos el agente inseguro
            headers: {
                // Fingimos ser un navegador real para que no nos bloqueen
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const html = await response.text();

        // 4. Usamos Cheerio (como BeautifulSoup) para leer el HTML
        const $ = cheerio.load(html);

        // Función auxiliar para limpiar el valor (Igual que fix_value en Python)
        const extraerValor = (idDiv) => {
            // Buscamos: <div id="dolar"> ... <strong> 45,50 </strong>
            const texto = $(`#${idDiv} strong`).text().trim();
            if (!texto) return 0;
            // Reemplazamos coma por punto
            return parseFloat(texto.replace(',', '.'));
        };

        const tasaDolar = extraerValor('dolar');
        const tasaEuro = extraerValor('euro');

        // Extraer fecha (Igual que en tu Python: class="date-display-single")
        let fechaBCV = $('.date-display-single').first().text().trim();
        if (!fechaBCV) fechaBCV = new Date().toISOString();

        console.log(`✅ Scraper BCV Exitoso. USD: ${tasaDolar} | EUR: ${tasaEuro}`);

        // 5. Devolvemos el JSON
        res.status(200).json({
            success: true,
            source: 'Scraper Directo BCV',
            fecha_valor: fechaBCV,
            rates: {
                usd: tasaDolar,
                eur: tasaEuro
            }
        });

    } catch (error) {
        console.error("❌ Error Scraper BCV:", error);
        res.status(500).json({ 
            success: false, 
            error: 'No se pudo leer la página del BCV',
            detalle: error.message 
        });
    }
}