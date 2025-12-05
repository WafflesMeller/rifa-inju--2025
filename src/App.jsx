import { useState, useEffect } from 'react'
import './App.css' // Puedes mantener esto o borrarlo si prefieres estilos limpios

function App() {
  // Estados para manejar el formulario
  const [titulo, setTitulo] = useState('PagomóvilBDV recibido')
  const [texto, setTexto] = useState('Recibiste pago móvil de JUAN PEREZ por Bs. 1.250,00 el 04/12 Ref: 12345678')
  
  // Estado para la respuesta inmediata del servidor
  const [resultado, setResultado] = useState(null)
  
  // Estado para la lista completa de notificaciones
  const [historial, setHistorial] = useState([])

  // 1. Función para enviar los datos al Backend (Node.js)
  const procesarNotificacion = async (e) => {
    e.preventDefault();
    try {
      // Preparamos los parámetros para la URL 
      const params = new URLSearchParams({
        TituloNotificacion: titulo,
        TextoNotificacion: texto
      });

      // Hacemos la petición al servidor local en el puerto 3000
      const response = await fetch(`http://localhost:3000/api/procesar?${params}`);
      const data = await response.json();
      
      // --- AQUÍ ESTÁ LA LÓGICA DEL MENSAJE ---
      // Mostramos la alerta que viene del servidor (Éxito o Error)
      alert(data.mensaje);

      setResultado(data);
      obtenerHistorial(); // Actualizamos la tabla de abajo
    } catch (error) {
      console.error("Error conectando con server:", error);
      alert("❌ Error: No se pudo conectar con el servidor (¿Está encendido?)");
    }
  }

  // 2. Función para cargar el historial guardado
  const obtenerHistorial = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/historial');
      const data = await res.json();
      setHistorial(data);
    } catch (error) { console.error(error) }
  }

  // Cargar historial apenas se abre la página
  useEffect(() => { obtenerHistorial() }, [])

  // 3. La Interfaz Visual (HTML/JSX)
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>
      <h1>📟 Monitor de Pagos (Venezuela)</h1>
      
      {/* --- FORMULARIO --- */}
      <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '8px', marginBottom: '20px', background: '#242424', color: 'white' }}>
        <h3>Simular Notificación Entrante</h3>
        <form onSubmit={procesarNotificacion}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{display: 'block', marginBottom: '5px'}}>Título de la Notificación:</label>
            <select 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            >
              <option value="PagomóvilBDV recibido">PagomóvilBDV recibido</option>
              <option value="Transferencia BDV recibida">Transferencia BDV recibida</option>
              <option value="Transferencia de otros bancos recibida">Transferencia de otros bancos recibida</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{display: 'block', marginBottom: '5px'}}>Texto del Mensaje:</label>
            <textarea 
              value={texto} 
              onChange={(e) => setTexto(e.target.value)}
              rows="3"
              style={{ width: '100%', padding: '10px', fontSize: '16px', fontFamily: 'monospace' }}
            />
          </div>
          
          <button type="submit" style={{ background: '#646cff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            Enviar Petición GET
          </button>
        </form>
      </div>

      {/* --- RESULTADO INMEDIATO --- */}
      {resultado && resultado.success && (
        <div style={{ marginTop: '15px', background: '#e6fffa', color: '#004d40', padding: '15px', borderRadius: '5px', border: '1px solid #b2f5ea' }}>
          <strong>✅ Procesado Exitoso:</strong>
          <ul style={{ margin: '10px 0 0 20px' }}>
            <li>Emisor: {resultado.data.emisor}</li>
            <li>Monto: {resultado.data.monto}</li>
            <li>Referencia: {resultado.data.referencia}</li>
          </ul>
        </div>
      )}

      {/* --- TABLA DE HISTORIAL --- */}
      <h3 style={{marginTop: '40px'}}>Historial de Transacciones</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', color: '#333', background: 'white' }}>
          <thead>
            <tr style={{ background: '#eee', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Fecha</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Banco</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Tipo</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Monto (Bs)</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Ref</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{item.fecha}</td>
                <td style={{ padding: '10px' }}>{item.banco}</td>
                <td style={{ padding: '10px', fontSize: '12px' }}>{item.tipo}</td>
                <td style={{ padding: '10px', color: 'green', fontWeight: 'bold' }}>{item.monto.toFixed(2)}</td>
                <td style={{ padding: '10px' }}>{item.referencia}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {historial.length === 0 && <p style={{textAlign: 'center', color: '#666', marginTop: '20px'}}>No hay transacciones aún.</p>}
      </div>
    </div>
  )
}

export default App