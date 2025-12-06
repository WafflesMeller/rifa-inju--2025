// utils/whatsapp.js

export const enviarMensajeRifa = async (numero, nombre, ticket) => {
  // TU URL DE RENDER (La que copiaste de los logs)
  const RENDER_URL = "https://whatsapp-server-rifa.onrender.com/enviar-mensaje";

  try {
    const respuesta = await fetch(RENDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numero: numero, // Ej: "04121234567"
        mensaje: `🎟️ Hola ${nombre}, ¡pago recibido! Tu ticket es el: ${ticket}. ¡Suerte! 🍀`
      }),
    });

    const data = await respuesta.json();
    
    if (respuesta.ok) {
      console.log("✅ WhatsApp enviado:", data);
      return true;
    } else {
      console.error("❌ Error enviando WhatsApp:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Error de conexión con el bot:", error);
    return false;
  }
};