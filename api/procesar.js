// =====================================================================
// ARCHIVO: api/procesar.js
// DESCRIPCIÓN: Serverless Function para Vercel que procesa notificaciones
// bancarias de Venezuela (BDV y Otros Bancos).
// =====================================================================

export default function handler(req, res) {
    // -----------------------------------------------------------------
    // 1. CONFIGURACIÓN DE CORS (SEGURIDAD Y ACCESO)
    // Permite que tu Frontend (React) se comunique con este Backend.
    // -----------------------------------------------------------------
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // En producción puedes poner tu dominio exacto
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  
    // Manejo de petición "Preflight" (OPTIONS)
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    // -----------------------------------------------------------------
    // 2. RECIBIR DATOS
    // Vercel extrae los parámetros de la URL automáticamente en req.query
    // -----------------------------------------------------------------
    const { TituloNotificacion, TextoNotificacion } = req.query;
  
    // LOGS DE SERVIDOR (Visibles en Vercel > Logs)
    console.log("------------------------------------------------");
    console.log("📩 NUEVA PETICIÓN ENTRANTE");
    console.log("🔎 Título:", TituloNotificacion);
    // console.log("📄 Texto:", TextoNotificacion); // Descomenta si necesitas depurar el texto exacto
  
    // -----------------------------------------------------------------
    // 3. VALIDACIONES INICIALES
    // -----------------------------------------------------------------
    if (!TituloNotificacion || !TextoNotificacion) {
        console.error("❌ Error: Faltan parámetros obligatorios.");
        return res.status(400).json({ 
            success: false, 
            mensaje: 'Faltan parámetros (TituloNotificacion o TextoNotificacion)' 
        });
    }

    if (TextoNotificacion.trim() === '') {
        console.warn("⚠️ Alerta: El texto de la notificación llegó vacío.");
        return res.status(400).json({ 
            success: false, 
            mensaje: 'El texto de la notificación está vacío.' 
        });
    }

    // -----------------------------------------------------------------
    // 4. FUNCIONES AUXILIARES
    // -----------------------------------------------------------------
    
    // Convierte formato venezolano "1.200,50" a número JS "1200.50"
    const parseMonto = (str) => {
        if (!str) return 0;
        // 1. Elimina todo lo que no sea número o coma (quita puntos de miles, letras, espacios)
        let limpio = str.replace(/[^\d,]/g, ''); 
        // 2. Reemplaza la coma decimal por punto
        return parseFloat(limpio.replace(',', '.')); 
    };

    // Estructura de respuesta por defecto
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

    // -----------------------------------------------------------------
    // 5. LÓGICA DE EXTRACCIÓN (REGEX POR BANCO)
    // -----------------------------------------------------------------

    // =========================================================
    // CASO A: PAGO MÓVIL BDV (Tiene 2 formatos posibles)
    // =========================================================
    if (tituloLimpio === 'PagomóvilBDV recibido') {
        data.tipo = 'PAGO_MOVIL';
        data.banco = 'BDV';
        
        // FORMATO 1: Con Nombre completo y "número de operación"
        // Ej: "...de YENDER... por Bs.903,00 bajo el número de operación 0044..."
        // Explicación Regex:
        //  de (.+?)             -> Captura el nombre (cualquier cosa hasta "por")
        //  por Bs\. ?([\d\.,]+) -> Captura el monto (el ? permite que haya espacio o no después de Bs.)
        //  operación (\d+)      -> Captura solo los dígitos de la operación
        const regexFormato1 = /de (.+?) por Bs\. ?([\d\.,]+).*operación (\d+)/i;
        
        // FORMATO 2: Con Teléfono y "Ref:"
        // Ej: "...por Bs.2.000,00 del 0424-XXX Ref: 190..."
        // Explicación Regex:
        //  por Bs\. ?([\d\.,]+) -> Captura monto primero
        //  del ([\d-]+)         -> Captura el teléfono (números y guiones)
        //  Ref[:\s]+(\d+)       -> Captura la referencia
        const regexFormato2 = /por Bs\. ?([\d\.,]+) del ([\d-]+).*Ref[:\s]+(\d+)/i;

        const match1 = TextoNotificacion.match(regexFormato1);
        const match2 = TextoNotificacion.match(regexFormato2);

        if (match1) {
            // --- ENCONTRADO FORMATO 1 (NOMBRE) ---
            data.emisor = match1[1].trim();
            data.monto = parseMonto(match1[2]);
            data.referencia = match1[3];
            procesado = true;
            mensajeCliente = "Pago Móvil (Formato Nombre) procesado correctamente.";
            console.log(`✅ MATCH PM TIPO 1: Ref ${data.referencia} - Bs. ${data.monto}`);
        } 
        else if (match2) {
            // --- ENCONTRADO FORMATO 2 (TELÉFONO) ---
            data.monto = parseMonto(match2[1]);
            data.emisor = match2[2].trim(); // El emisor será el teléfono
            data.referencia = match2[3];
            procesado = true;
            mensajeCliente = "Pago Móvil (Formato Teléfono) procesado correctamente.";
            console.log(`✅ MATCH PM TIPO 2: Ref ${data.referencia} - Bs. ${data.monto}`);
        } 
        else {
            mensajeCliente = "El texto no coincide con ninguno de los formatos BDV esperados.";
            console.warn("⚠️ FALLO REGEX: Pago Móvil BDV (Texto no reconocido)");
        }
    } 

    // =========================================================
    // CASO B: TRANSFERENCIA OTROS BANCOS
    // =========================================================
    // Ej: "...de OHA Technology C.A. por Bs. 801,10 bajo el número de operación..."
    else if (tituloLimpio === 'Transferencia de otros bancos recibida') {
        data.tipo = 'TRANSFERENCIA_INTERBANCARIA';
        data.banco = 'OTROS';

        // Misma estructura que PM Tipo 1: Nombre, Monto, Operación
        const regexOtros = /de (.+?) por Bs\. ?([\d\.,]+).*operación (\d+)/i;
        const match = TextoNotificacion.match(regexOtros);
        
        if (match) {
            data.emisor = match[1].trim();
            data.monto = parseMonto(match[2]);
            data.referencia = match[3];
            procesado = true;
            mensajeCliente = "Transferencia de Otros Bancos procesada correctamente.";
            console.log(`✅ MATCH OTROS BANCOS: Ref ${data.referencia} - Bs. ${data.monto}`);
        } else {
            mensajeCliente = "El texto no coincide con el formato de Otros Bancos.";
            console.warn("⚠️ FALLO REGEX: Otros Bancos");
        }
    } 

    // =========================================================
    // CASO C: TRANSFERENCIA INTERNA BDV (Opcional/Respaldo)
    // =========================================================
    else if (tituloLimpio === 'Transferencia BDV recibida') {
        data.tipo = 'TRANSFERENCIA_INTERNA';
        data.banco = 'BDV';
        // Formato estándar BDV interno
        const regexTrans = /monto de Bs\. ?([\d\.,]+).*Ref[:\s]+(\d+)/i;
        const match = TextoNotificacion.match(regexTrans);

        if (match) {
            data.monto = parseMonto(match[1]);
            data.referencia = match[2];
            procesado = true;
            mensajeCliente = "Transferencia BDV interna procesada.";
            console.log(`✅ MATCH TRANSF BDV: Ref ${data.referencia}`);
        } else {
            mensajeCliente = "Formato no coincide con Transferencia BDV.";
        }
    }

    // =========================================================
    // CASO D: TÍTULO DESCONOCIDO
    // =========================================================
    else {
        mensajeCliente = `El título "${tituloLimpio}" no está configurado en el sistema.`;
        console.warn(`⛔ TÍTULO DESCONOCIDO: ${tituloLimpio}`);
    }

    // -----------------------------------------------------------------
    // 6. RESPUESTA FINAL AL CLIENTE
    // -----------------------------------------------------------------
    res.status(200).json({ 
        success: procesado, 
        mensaje: mensajeCliente, 
        data: data 
    });
}