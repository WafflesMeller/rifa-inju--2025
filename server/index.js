const http = require('node:http');

const PORT = 5173;

// Función auxiliar para convertir texto a número
const parseMonto = (str) => {
    if (!str) return 0;
    let limpio = str.replace(/[^\d,]/g, '');
    return parseFloat(limpio.replace(',', '.'));
};

const server = http.createServer((req, res) => {
    // 1. Configuración de CORS
    const headers = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json; charset=utf-8'
    };

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    const myURL = new URL(req.url, `http://${req.headers.host}`);
    
    // ---------------------------------------------------------
    // ENDPOINT: /api/procesar
    // ---------------------------------------------------------
    if (req.method === 'GET' && myURL.pathname === '/api/procesar') {
        const titulo = myURL.searchParams.get('TituloNotificacion');
        const texto = myURL.searchParams.get('TextoNotificacion');

        console.log('\n------------------------------------------------');
        console.log('📩 PETICIÓN RECIBIDA (Sin guardar historial)');

        if (!titulo || !texto) {
            console.log('❌ RECHAZADA: Faltan parámetros.');
            res.writeHead(400, headers);
            res.end(JSON.stringify({ error: 'Faltan parámetros' }));
            return;
        }

        console.log(`🔎 Título: "${titulo}"`);

        if (texto.trim() === '') {
            console.log('⚠️ ALERTA: Texto vacío.');
            res.writeHead(400, headers);
            res.end(JSON.stringify({ 
                success: false, 
                mensaje: 'El texto de la notificación está vacío.' 
            }));
            return;
        }

        let data = {
            tipo: 'DESCONOCIDO',
            banco: 'DESCONOCIDO',
            monto: 0,
            referencia: 'N/A',
            emisor: 'No identificado'
        };

        let procesado = false;
        let mensajeCliente = "";

        // LÓGICA DE PROCESAMIENTO
        if (titulo.trim() === 'PagomóvilBDV recibido') {
            console.log('✅ Detectado: Pago Móvil BDV.');
            data.tipo = 'PAGO_MOVIL';
            data.banco = 'BDV';
            
            const regex = /de (.+?) por Bs\. ([\d\.,]+).*Ref[:\s]+(\d+)/i;
            const match = texto.match(regex);
            
            if (match) {
                data.emisor = match[1].trim();
                data.monto = parseMonto(match[2]);
                data.referencia = match[3];
                procesado = true;
                mensajeCliente = "Pago Móvil procesado correctamente.";
                console.log(`   ➜ Monto: ${data.monto}, Ref: ${data.referencia}`);
            } else {
                console.log('   ⚠️ Error: Falló la lectura de datos (Regex).');
                mensajeCliente = "Formato no coincide con Pago Móvil.";
            }
        } 
        else if (titulo.trim() === 'Transferencia BDV recibida') {
            console.log('✅ Detectado: Transferencia BDV.');
            data.tipo = 'TRANSFERENCIA_INTERNA';
            data.banco = 'BDV';

            const regex = /monto de Bs\. ([\d\.,]+).*Ref[:\s]+(\d+)/i;
            const match = texto.match(regex);

            if (match) {
                data.monto = parseMonto(match[1]);
                data.referencia = match[2];
                procesado = true;
                mensajeCliente = "Transferencia BDV procesada correctamente.";
                console.log(`   ➜ Monto: ${data.monto}, Ref: ${data.referencia}`);
            } else {
                console.log('   ⚠️ Error: Falló la lectura de datos.');
                mensajeCliente = "Formato no coincide con Transferencia BDV.";
            }
        }
        else if (titulo.trim() === 'Transferencia de otros bancos recibida') {
            console.log('✅ Detectado: Transferencia Interbancaria.');
            data.tipo = 'TRANSFERENCIA_INTERBANCARIA';
            data.banco = 'OTROS';

            const regex = /Bs\. ([\d\.,]+).*banco (\w+).*Ref[:\s]+(\d+)/i;
            const match = texto.match(regex);

            if (match) {
                data.monto = parseMonto(match[1]);
                data.emisor = `Banco ${match[2]}`;
                data.referencia = match[3];
                procesado = true;
                mensajeCliente = "Pago Otros Bancos procesado correctamente.";
                console.log(`   ➜ Monto: ${data.monto}, Ref: ${data.referencia}`);
            } else {
                console.log('   ⚠️ Error: Falló la lectura de datos.');
                mensajeCliente = "Formato no coincide con Otros Bancos.";
            }
        } 
        else {
            console.log('⛔ Título no configurado.');
            mensajeCliente = "Título desconocido.";
        }

        // NO GUARDAMOS NADA EN HISTORIAL. SOLO RESPONDEMOS.
        res.writeHead(200, headers);
        res.end(JSON.stringify({ 
            success: procesado, 
            mensaje: mensajeCliente, 
            data: data 
        }));
    }
    
    // Cualquier otra ruta da 404
    else {
        res.writeHead(404, headers);
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 SERVIDOR (SIN HISTORIAL) LISTO EN: http://localhost:${PORT}`);
});