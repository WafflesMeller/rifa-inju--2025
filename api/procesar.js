// Archivo: api/procesar.js

export default function handler(req, res) {
    // 1. Configurar CORS (Para que funcione desde cualquier lugar)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  
    // Si es una petición OPTIONS (preflight), respondemos OK y terminamos
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    // 2. Obtener parámetros (Vercel ya te los da procesados en req.query)
    const { TituloNotificacion, TextoNotificacion } = req.query;
  
    // 3. Validaciones
    if (!TituloNotificacion || !TextoNotificacion) {
        return res.status(400).json({ error: 'Faltan parámetros' });
    }

    if (TextoNotificacion.trim() === '') {
        return res.status(400).json({ 
            success: false, 
            mensaje: 'El texto de la notificación está vacío.' 
        });
    }

    // 4. Lógica de Regex (Tu misma lógica)
    const parseMonto = (str) => {
        if (!str) return 0;
        let limpio = str.replace(/[^\d,]/g, '');
        return parseFloat(limpio.replace(',', '.'));
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
    const titulo = TituloNotificacion.trim();

    if (titulo === 'PagomóvilBDV recibido') {
        data.tipo = 'PAGO_MOVIL';
        data.banco = 'BDV';
        const regex = /de (.+?) por Bs\. ([\d\.,]+).*Ref[:\s]+(\d+)/i;
        const match = TextoNotificacion.match(regex);
        if (match) {
            data.emisor = match[1].trim();
            data.monto = parseMonto(match[2]);
            data.referencia = match[3];
            procesado = true;
            mensajeCliente = "Pago Móvil procesado correctamente.";
        } else {
            mensajeCliente = "Formato no coincide con Pago Móvil.";
        }
    } 
    else if (titulo === 'Transferencia BDV recibida') {
        data.tipo = 'TRANSFERENCIA_INTERNA';
        data.banco = 'BDV';
        const regex = /monto de Bs\. ([\d\.,]+).*Ref[:\s]+(\d+)/i;
        const match = TextoNotificacion.match(regex);
        if (match) {
            data.monto = parseMonto(match[1]);
            data.referencia = match[2];
            procesado = true;
            mensajeCliente = "Transferencia BDV procesada correctamente.";
        } else {
            mensajeCliente = "Formato no coincide con Transferencia BDV.";
        }
    }
    else if (titulo === 'Transferencia de otros bancos recibida') {
        data.tipo = 'TRANSFERENCIA_INTERBANCARIA';
        data.banco = 'OTROS';
        const regex = /Bs\. ([\d\.,]+).*banco (\w+).*Ref[:\s]+(\d+)/i;
        const match = TextoNotificacion.match(regex);
        if (match) {
            data.monto = parseMonto(match[1]);
            data.emisor = `Banco ${match[2]}`;
            data.referencia = match[3];
            procesado = true;
            mensajeCliente = "Pago Otros Bancos procesado correctamente.";
        } else {
            mensajeCliente = "Formato no coincide con Otros Bancos.";
        }
    } 
    else {
        mensajeCliente = "Título desconocido.";
    }

    // 5. Responder
    res.status(200).json({ 
        success: procesado, 
        mensaje: mensajeCliente, 
        data: data 
    });
}