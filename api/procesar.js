// =====================================================================
// ARCHIVO: api/procesar.js (Soporte Híbrido GET/POST)
// =====================================================================
import { createClient } from '@supabase/supabase-js';

// 1. INICIALIZAR SUPABASE
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    // -----------------------------------------------------------------
    // 2. RECIBIR DATOS (AHORA SOPORTA BODY Y QUERY)
    // -----------------------------------------------------------------
    // Intentamos leer del BODY (Post) primero, si no hay nada, leemos del QUERY (Get)
    const bodyData = req.body || {};
    const queryData = req.query || {};

    const TituloNotificacion = bodyData.TituloNotificacion || queryData.TituloNotificacion;
    const TextoNotificacion = bodyData.TextoNotificacion || queryData.TextoNotificacion;

    // Capturamos la hora
    const fechaExactaServidor = new Date().toISOString();

    if (!TituloNotificacion || !TextoNotificacion) {
        return res.status(400).json({ error: 'Faltan parámetros (Titulo o Texto)' });
    }
    if (String(TextoNotificacion).trim() === '') {
        return res.status(400).json({ success: false, mensaje: 'Texto vacío.' });
    }

    // -----------------------------------------------------------------
    // LÓGICA DE PROCESAMIENTO (REGEX) - IGUAL QUE ANTES
    // -----------------------------------------------------------------
    const parseMonto = (str) => {
        if (!str) return 0;
        let limpio = str.replace(/[^\d,]/g, ''); 
        return parseFloat(limpio.replace(',', '.')); 
    };

    const formatearMontoVisual = (numero) => {
        return "Bs. " + numero.toLocaleString('es-VE', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    let data = {
        tipo: 'DESCONOCIDO',
        banco: 'DESCONOCIDO',
        monto: 0,
        referencia: 'N/A',
        emisor: 'No identificado'
    };

    let procesado = false;
    let mensajeCliente = "";
    const tituloLimpio = TituloNotificacion.trim();

    // --- CASO A: PAGO MÓVIL BDV ---
    if (tituloLimpio === 'PagomóvilBDV recibido') {
        data.tipo = 'PAGO_MOVIL';
        data.banco = 'BDV';
        const regexFormato1 = /de (.+?) por Bs\. ?([\d\.,]+).*operación (\d+)/i;
        const regexFormato2 = /por Bs\. ?([\d\.,]+) del ([\d-]+).*Ref[:\s]+(\d+)/i;
        const match1 = TextoNotificacion.match(regexFormato1);
        const match2 = TextoNotificacion.match(regexFormato2);

        if (match1) {
            data.emisor = match1[1].trim();
            data.monto = parseMonto(match1[2]);
            data.referencia = match1[3];
            procesado = true;
            mensajeCliente = "Pago Móvil (Nombre) procesado.";
        } else if (match2) {
            data.monto = parseMonto(match2[1]);
            data.emisor = match2[2].trim();
            data.referencia = match2[3];
            procesado = true;
            mensajeCliente = "Pago Móvil (Teléfono) procesado.";
        } else {
            mensajeCliente = "Formato Pago Móvil no reconocido.";
        }
    } 
    // --- CASO B: OTROS BANCOS ---
    else if (tituloLimpio === 'Transferencia de otros bancos recibida') {
        data.tipo = 'TRANSFERENCIA_INTERBANCARIA';
        data.banco = 'OTROS';
        const regexOtros = /de (.+?) por Bs\. ?([\d\.,]+).*operación (\d+)/i;
        const match = TextoNotificacion.match(regexOtros);
        if (match) {
            data.emisor = match[1].trim();
            data.monto = parseMonto(match[2]);
            data.referencia = match[3];
            procesado = true;
            mensajeCliente = "Transferencia Otros Bancos procesada.";
        } else {
            mensajeCliente = "Formato Otros Bancos no reconocido.";
        }
    } 
  // --- CASO C: TRANSFERENCIA BDV ---
    else if (tituloLimpio === 'Transferencia BDV recibida') {
        data.tipo = 'TRANSFERENCIA_INTERNA';
        data.banco = 'BDV';

        // FORMATO 1 (Nuevo): "...de ALEYKIS... por Bs.1,08 bajo el número de operación..."
        const regexFormato1 = /de (.+?) por Bs\. ?([\d\.,]+).*operación (\d+)/i;
        
        // FORMATO 2 (Antiguo): "monto de Bs. 100 Ref: 123456"
        const regexFormato2 = /monto de Bs\. ?([\d\.,]+).*Ref[:\s]+(\d+)/i;

        const match1 = TextoNotificacion.match(regexFormato1);
        const match2 = TextoNotificacion.match(regexFormato2);

        if (match1) {
            data.emisor = match1[1].trim();
            data.monto = parseMonto(match1[2]);
            data.referencia = match1[3];
            procesado = true;
            mensajeCliente = "Transferencia BDV (Con Nombre) procesada.";
        } else if (match2) {
            data.monto = parseMonto(match2[1]);
            data.referencia = match2[2];
            procesado = true;
            mensajeCliente = "Transferencia BDV (Formato Simple) procesada.";
        } else {
            mensajeCliente = "Formato Transferencia BDV no reconocido.";
        }
    }

    // -----------------------------------------------------------------
    // GUARDAR EN SUPABASE
    // -----------------------------------------------------------------
    if (procesado) {
        try {
            const montoVisual = formatearMontoVisual(data.monto);
            const { error } = await supabase
                .from('historial_pagos')
                .insert({
                    referencia: data.referencia,
                    monto_exacto: montoVisual,     
                    monto_numerico: data.monto,
                    titulo_original: TituloNotificacion,
                    texto_original: TextoNotificacion,
                    banco: data.banco,
                    fecha_procesado: fechaExactaServidor
                });
            if (error) console.error("❌ Error Supabase:", error);
            else console.log("✅ Guardado POST/GET exitoso");
        } catch (err) { console.error("❌ Error inesperado:", err); }
    }

    res.status(200).json({ success: procesado, mensaje: mensajeCliente, data: data });
}