import { useState } from 'react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  // ⚠️ CONFIGURA ESTO AQUÍ
  const RENDER_URL = "https://whatsapp-server-rifa.onrender.com/enviar-mensaje"; 
  const MI_NUMERO = "584242929579"; // Tu número real con código de país (sin +)

  const enviarPrueba = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(RENDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numero: MI_NUMERO,
          mensaje: "🤖 ¡Hola! Si estás leyendo esto, tu sistema de Rifa funciona perfectamente."
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ ¡Éxito! Revisa tu WhatsApp.");
      } else {
        alert("❌ Error del servidor: " + (data.error || "Desconocido"));
      }

    } catch (error) {
      console.error("Error:", error);
      alert("⚠️ Error de conexión. Revisa la consola (F12) y asegúrate de haber activado CORS en Render ok.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <button 
        onClick={enviarPrueba}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#25D366', // Verde WhatsApp
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          borderRadius: '50px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}
      >
        {loading ? '⏳ Enviando...' : '📲 Enviar Mensaje de Prueba'}
      </button>
    </div>
  );
}