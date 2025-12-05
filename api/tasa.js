// URL oficial de la API
const API_URL = 'https://api.dolarvzla.com/public/exchange-rate';

/**
 * Función para obtener y formatear la tasa de cambio.
 * Retorna un string listo para enviar por mensaje.
 */
async function getTasa() {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    // 1. Formateo de Fecha (De YYYY-MM-DD a DD/MM/YYYY)
    // Se usa split para evitar problemas de zona horaria con new Date()
    const [year, month, day] = data.current.date.split('-');
    const fechaStr = `${day}/${month}/${year}`;

    // 2. Helpers de formato
    const fmtMoney = (amount) => {
        // Formato Venezuela: coma para decimales, punto para miles
        return new Intl.NumberFormat('es-VE', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        }).format(amount);
    };

    const getTrend = (pct) => {
        if (pct > 0) return `🔺 ${fmtMoney(pct)}%`;
        if (pct < 0) return `🔻 ${fmtMoney(pct)}%`;
        return `= 0.00%`;
    };

    // 3. Construcción del mensaje
    const message = `
📊 *Tasa de Cambio - ${fechaStr}*
──────────────────
💵 *Dólar BCV:* ${fmtMoney(data.current.usd)} Bs (${getTrend(data.changePercentage.usd)})
💶 *Euro BCV:* ${fmtMoney(data.current.eur)} Bs (${getTrend(data.changePercentage.eur)})
    `.trim();

    return message;

  } catch (error) {
    console.error('Error obteniendo tasa:', error);
    return '⚠️ No se pudo obtener la tasa de cambio en este momento.';
  }
}

module.exports = { getTasa };