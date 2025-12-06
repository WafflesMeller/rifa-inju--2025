// server.js
// ------------------------------------------------------------------
// Servidor Express (Backend)
// ------------------------------------------------------------------

const express = require('express');
const cors = require('cors');
const { consultaCedula } = require('./saime-flujo');

const app = express();
const PORT = 3001; // Puerto donde vivirá el backend

// Middleware hola
app.use(cors()); // Permite que Vite (puerto 5173) hable con este server
app.use(express.json());

// Ruta de prueba para ver si el server vive
app.get('/', (req, res) => {
    res.send('🤖 Servidor SAIME activo. Usa /api/cedula/V/123456');
});

// Endpoint Principal: GET /api/cedula/:letra/:numero
app.get('/api/cedula/:nacionalidad/:numero', async (req, res) => {
    const { nacionalidad, numero } = req.params;
    
    // Validación básica
    if (!['V', 'E'].includes(nacionalidad.toUpperCase())) {
        return res.status(400).json({ success: false, error: 'Nacionalidad inválida (Use V o E)' });
    }

    console.log(`📡 Recibida consulta: ${nacionalidad}-${numero}`);

    try {
        const resultado = await consultaCedula(nacionalidad.toUpperCase(), numero);

        // Caso 1: Encontrado exitosamente
        if (resultado.found) {
            return res.json({
                success: true,
                data: {
                    nombres: `${resultado.primerNombre} ${resultado.segundoNombre}`.trim(),
                    apellidos: `${resultado.primerApellido} ${resultado.segundoApellido}`.trim(),
                    fechaNacimiento: resultado.fechaNacimiento, // DD/MM/AAAA
                    edad: resultado.edad
                }
            });
        }

        // Caso 2: Alerta (Ej. Fallecido o Cédula objetada)
        if (resultado.alert) {
            return res.json({
                success: false,
                alert: true,
                message: `ALERTA SAIME: ${resultado.alert}`
            });
        }

        // Caso 3: No encontrado simple
        return res.status(404).json({
            success: false,
            message: 'Cédula no encontrada en el registro.'
        });

    } catch (error) {
        console.error('❌ Error interno:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error de conexión con el SAIME. Intenta de nuevo.'
        });
    }
});

// Iniciar servidors
app.listen(PORT, () => {
    console.log(`✅ Servidor listo en http://localhost:${PORT}`);
});