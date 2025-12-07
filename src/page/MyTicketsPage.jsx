// src/page/MyTicketsPage.jsx
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Search, Ticket, Calendar, User, AlertCircle } from 'lucide-react';
import { CedulaInput } from '../components/FormInputs';

export default function MyTicketsPage({ onBack }) {
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [compras, setCompras] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // Para saber si ya buscó
  const [errorMsg, setErrorMsg] = useState('');

  // Convierte el valor del input (ej: "V-28184233" o "28184233" o "V28184233")
  // al formato que está en la BD: "V28184233" o "E12345678"
  const getDbCedula = (value) => {
    if (!value) return '';

    const str = String(value).trim();

    // Si viene con guion "V-123" -> "V123"
    if (str.includes('-')) {
      const [tipo, num] = str.split('-');
      return `${(tipo || '').toUpperCase().replace(/\s+/g, '')}${(num || '').replace(/\D/g, '')}`;
    }

    // Si viene como "V123456" -> normalizar mayúscula
    if (/^[VEve]\d+$/.test(str)) {
      return str.toUpperCase();
    }

    // Si viene solo números -> asumimos "V" por defecto (según tu conveniencia)
    if (/^\d+$/.test(str)) {
      return `V${str}`;
    }

    // fallback: devolver tal cual limpiando espacios
    return str.replace(/\s+/g, '');
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const dbCedula = getDbCedula(cedula);
    // extraer la parte numérica para validar longitud mínima
    const numericPart = dbCedula.replace(/^[VE]/i, '').replace(/\D/g, '');

    if (numericPart.length < 5) {
      setErrorMsg("Por favor ingresa una cédula válida.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setCompras([]);
    setHasSearched(true);

    try {
      // Buscamos en la tabla 'ventas' por cédula
      // Traemos las ventas PAGADAS
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('cedula', dbCedula) // ahora buscamos en el formato exacto que hay en la BD (ej: "V28184233")
        .eq('estado', 'pagado') // Solo mostrar confirmados
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCompras(data || []);

    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error al buscar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    // APLICAMOS EL COLOR OSCURO AL ROOT para que ocupe TODO el fondo
    <div className="min-h-screen flex flex-col font-poppins"
            style={{ background: 'linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)' }}
            >
      
      {/* HEADER TIPO APP (ahora transparente sobre el fondo global) */}
      <div className="bg-transparent text-white px-6 py-8 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64  rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">Mis Tickets 🎟️</h1>
          <p className="text-indigo-200 text-sm">Consulta tus números comprados ingresando tu cédula.</p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL (Flotando sobre el header). 
          Nota: mantengo -mt-10 para efecto "card" sobre el header */}
      <div className="flex-1 px-4 -mt-10 pb-10">
        <div className="max-w-2xl mx-auto">
          
          {/* TARJETA DE BÚSQUEDA (blanca sobre fondo oscuro) */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>

                {/* Usamos el CedulaInput aquí */}
                <CedulaInput
                  id="search-cedula"
                  name="cedula"
                  label="Cédula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Consultar</span>
                  </>
                )}
              </button>
            </form>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errorMsg}
              </div>
            )}
          </div>

          {/* RESULTADOS */}
          <div className="space-y-6">
            
            {/* ESTADO VACÍO (Si buscó y no encontró) */}
            {hasSearched && !loading && compras.length === 0 && !errorMsg && (
              <div className="text-center py-10 opacity-60 text-indigo-200">
                <Ticket className="w-16 h-16 mx-auto text-indigo-200 mb-3" />
                <h3 className="text-lg font-bold text-indigo-100">No encontramos tickets</h3>
                <p className="text-sm text-indigo-200">No hay compras registradas con la cédula {getDbCedula(cedula) || cedula}.</p>
              </div>
            )}

            {/* LISTA DE COMPRAS */}
            {compras.map((compra) => (
              <div key={compra.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Cabecera de la Tarjeta */}
                <div className="bg-indigo-50/50 px-6 py-4 flex flex-wrap justify-between items-center gap-3 border-b border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-semibold">{formatDate(compra.created_at)}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                    Pagado
                  </span>
                </div>

                {/* Cuerpo de la Tarjeta */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Cliente</p>
                      <p className="text-gray-800 font-medium">{compra.nombre_cliente}</p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-left sm:text-right">
                       <p className="text-xs text-gray-400 uppercase font-bold">Recibo #</p>
                       <p className="font-mono text-gray-600">ID-{compra.id}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                      <Ticket className="w-4 h-4" />
                      Tus Números de la Suerte:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {compra.tickets_seleccionados && compra.tickets_seleccionados.map((num) => (
                        <span key={num} className="bg-indigo-600 text-white text-lg font-bold px-4 py-2 rounded-lg shadow-sm  border-b-4 border-indigo-800 active:translate-y-0.5">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
