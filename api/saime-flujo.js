// saime-flujo.js
// ------------------------------------------------------------------
// Lógica de scraping pura. No toca React ni Express.
// ------------------------------------------------------------------

const gotImport     = require('got');
const got           = gotImport.default || gotImport; // Compatibilidad ESM/CommonJS
const { CookieJar } = require('tough-cookie');
const { load }      = require('cheerio');
const https         = require('https');

// URL Base del SAIME
const BASE = 'https://controlfronterizo.saime.gob.ve/index.php?r=dregistro/dregistro';

// Función Helper para esperar (sleep)
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function consultaCedula(letra = 'V', cedula) {
  // 1. Crear un navegador "virgen" (CookieJar nuevo) para esta consulta
  const jar = new CookieJar();
  const client = got.extend({
    http2: true,
    cookieJar: jar,
    timeout: { request: 20000 }, // 20 segundos máximo
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    },
    https: { rejectUnauthorized: true }, // En producción a veces se pone false si los certs del gobierno fallan
    agent: { https: new https.Agent({ keepAlive: true }) },
    followRedirect: true,
    throwHttpErrors: false
  });

  let csrfToken = null;

  // Función interna para obtener el token de seguridad
  const getToken = async () => {
    const resp = await client.get(`${BASE}/cedula`);
    const $ = load(resp.body);
    csrfToken = $('input[name="YII_CSRF_TOKEN"]').attr('value') || '';
  };

  const maxRetries = 3; // Intentos máximos si falla la red

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // A) Obtener Token si no lo tenemos
      if (!csrfToken) await getToken();

      const formBase = {
        YII_CSRF_TOKEN: csrfToken,
        'Dregistro[letra]': letra
      };

      // B) POST /letra (Establecer nacionalidad)
      await client.post(`${BASE}/letra`, {
        form: {
          ...formBase,
          'Dregistro[num_cedula]': '',
          'Dregistro[num_pasaporte]': ''
        }
      });

      // C) POST /cedula (Enviar número y obtener datos)
      const resp = await client.post(`${BASE}/cedula`, {
        form: {
          ...formBase,
          'Dregistro[num_cedula]': cedula.toString(),
          'Dregistro[num_pasaporte]': ''
        }
      });

      // Validar errores del servidor (5xx)
      if (resp.statusCode >= 500) {
        throw new Error(`Error del Servidor SAIME (HTTP ${resp.statusCode})`);
      }

      // D) Parsear HTML con Cheerio
      const $ = load(resp.body);
      const getVal = sel => $(sel).val()?.trim() || '';

      const primerNombre    = getVal('#Dregistro_primernombre');
      const segundoNombre   = getVal('#Dregistro_segundonombre');
      const primerApellido  = getVal('#Dregistro_primerapellido');
      const segundoApellido = getVal('#Dregistro_segundoapellido');
      const fechaNac        = getVal('#Dregistro_fecha_nac'); // Viene como DD/MM/AAAA

      // E) Verificar si encontramos datos
      if (primerNombre && primerApellido) {
        // Calcular edad
        let edad = null;
        const m = fechaNac.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (m) {
          const [, d, mo, y] = m.map(Number);
          const n = new Date(y, mo - 1, d);
          edad = Math.floor((Date.now() - n.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        }

        return {
          found: true,
          primerNombre,
          segundoNombre,
          primerApellido,
          segundoApellido,
          fechaNacimiento: fechaNac,
          edad
        };
      }

      // F) Verificar si dice "FALLECIDO" u otra alerta
      const alerta = $('.btn.btn-danger').first().text().trim();
      if (alerta && alerta.length > 0) {
        return { found: false, alert: alerta };
      }

      // Si no hay datos ni alerta, y no es error 500, tal vez el token expiró. Reintentar.
      if (attempt < maxRetries) {
        csrfToken = null; // Forzar nuevo token
        await sleep(1500);
        continue;
      }
      
      return { found: false, error: 'Datos no encontrados' };

    } catch (err) {
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) throw err;
      // Si no, esperar un poco y reintentar
      await sleep(2000);
    }
  }
}

module.exports = { consultaCedula };