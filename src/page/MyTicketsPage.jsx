// src/page/MyTicketsPage.jsx
import React, { useState } from 'react';
import { supabase } from '../supabase';
import {
  Search,
  Ticket,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Sparkles,
  SearchCheck,
  ArrowBigDown,
  ChevronDown,
} from 'lucide-react';

export default function MyTicketsPage({ onBack }) {
  // Mantener cedula en formato visual "V-12345678"
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [compras, setCompras] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Control interno del input propio (select + número)
  const [tipo, setTipo] = useState('V');
  const [numero, setNumero] = useState('');

  // Sincroniza el estado visual del input (tipo + numero) con `cedula`
  const syncCedula = (t, n) => {
    if (!n) {
      setCedula(`${t}-`);
    } else {
      setCedula(`${t}-${n}`);
    }
  };

  const onTipoChange = (t) => {
    setTipo(t);
    syncCedula(t, numero);
  };

  const onNumeroChange = (n) => {
    const filtered = String(n).replace(/\D/g, '').slice(0, 8); // solo números, max 8
    setNumero(filtered);
    syncCedula(tipo, filtered);
  };

  // Convierte cualquier entrada al formato EXACTO que hay en la BD: "V-12345678"
  const getDbCedula = (value) => {
    if (!value) return '';

    const str = String(value).trim();

    // Si ya viene en formato V-123 (bien formado)
    if (/^[VE]-\d+$/i.test(str)) {
      return str.toUpperCase();
    }

    // Si viene sin guion: V123456 -> V-123456
    if (/^[VE]\d+$/.test(str)) {
      const tipo = str[0].toUpperCase();
      const num = str.slice(1).replace(/\D/g, '');
      return `${tipo}-${num}`;
    }

    // Si viene solo números -> V-123456
    if (/^\d+$/.test(str)) {
      return `V-${str}`;
    }

    // Si tiene guion pero espacios o formato raro: "V - 123" -> normalize
    if (str.includes('-')) {
      const [tRaw, numRaw] = str.split('-');
      const t = (tRaw || 'V').toUpperCase().replace(/\s+/g, '');
      const num = (numRaw || '').replace(/\D/g, '');
      return `${t}-${num}`;
    }

    // Fallback: devolver en mayúsculas (sin cambios)
    return str.toUpperCase();
  };

  // Búsqueda (event opcional para permitir llamada directa)
  const handleSearch = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const dbCedula = getDbCedula(cedula);
    const numericPart = dbCedula.replace(/^[VE]-?/i, '').replace(/\D/g, '');

    if (numericPart.length < 5) {
      setErrorMsg('Por favor ingresa una cédula válida.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setCompras([]);
    setHasSearched(true);

    try {
      // Busca exactamente el string con guion en la BD (ej: "V-28184233")
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('cedula', dbCedula)
        .eq('estado', 'pagado')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCompras(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error al buscar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Formato de fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Inicializar visualmente el cedula si tipo/numero cambian (por ejemplo al montar)
  React.useEffect(() => {
    syncCedula(tipo, numero);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col font-poppins relative selection:bg-indigo-500 selection:text-white"
      style={{ background: 'linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)' }}
    >
      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 pt-16 pb-10">
        {/* HEADER */}
        <div className="text-center mb-10 max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-4 backdrop-blur-md border border-white/10 shadow-xl">
            <Ticket className="w-8 h-8 text-indigo-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Mis Tickets</h1>
          <p className="text-indigo-200 text-base md:text-lg font-light">
            Consulta tus números de la suerte ingresando tu cédula.
          </p>
        </div>

        {/* BUSCADOR MODERNO (FLOTANTE) */}
        <div className="w-full max-w-xl mb-12">
          <form onSubmit={handleSearch} className="relative group">
            {/* Efecto de resplandor detrás del input */}
            <div className="absolute -inset-0.5 rounded-full "></div>

            <div className="relative bg-white rounded-full p-2 shadow-2xl flex items-center">
              {/* SELECTOR (Estilo Píldora) */}
              <div className="relative border-r border-gray-200 pr-2">
                <select
                  value={tipo}
                  onChange={(e) => onTipoChange(e.target.value)}
                  className="appearance-none bg-gray-50 text-gray-700 font-bold py-3 pl-4 pr-8 rounded-full outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <option value="V">V</option>
                  <option value="E">E</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown />
                </div>
              </div>

              {/* INPUT (Limpio) */}
              <input
                type="text"
                inputMode="numeric"
                value={numero}
                onChange={(e) => onNumeroChange(e.target.value)}
                placeholder="Ej: 12345678"
                className="flex-1 bg-transparent border-none outline-none px-4 text-lg text-gray-800 placeholder-gray-400 font-medium w-full"
              />

              {/* BOTÓN (Integrado) */}
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-indigo-500/30"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-6 h-6" />
                )}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="mt-4 p-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* RESULTADOS (Estilo Ticket) */}
        <div className="w-full max-w-2xl space-y-6">
          {hasSearched && !loading && compras.length === 0 && !errorMsg && (
            <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
              <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-10 h-10 text-indigo-300 opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sin resultados</h3>
              <p className="text-indigo-200">
                No encontramos tickets asociados a la cédula{' '}
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white">
                  {getDbCedula(cedula) || cedula}
                </span>
                .
              </p>
            </div>
          )}

          {compras.map((compra) => (
            <div
              key={compra.id}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all hover:-translate-y-1 hover:shadow-indigo-500/20"
            >
              {/* Decoración superior tipo ticket */}
              <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Comprador</p>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-8 h-8 text-indigo-500" />
                      {compra.nombre_cliente}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 mb-1">
                      <CheckCircle className="w-3 h-3" /> PAGADO
                    </div>
                    <p className="text-xs text-gray-400 font-mono">Recibo #{compra.id}</p>
                  </div>
                </div>

                {/* Línea divisoria punteada */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute -left-10 w-6 h-6 bg-[#161a2c] rounded-full"></div> {/* Muesca izq */}
                  <div className="w-full border-t-3 border-dashed border-gray-200"></div>
                  <div className="absolute -right-10 w-6 h-6 bg-[#161a2c] rounded-full "
                  ></div> {/* Muesca der */}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Tus Números Participantes:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {compra.tickets_seleccionados &&
                      compra.tickets_seleccionados.map((num) => (
                        <div
                          key={num}
                          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 flex flex-col items-center min-w-20 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors"
                        >
                          <span className="text-xs text-gray-400 uppercase">Ticket</span>
                          <span className="text-2xl font-black text-gray-800 tracking-tighter group-hover:text-indigo-600">
                            {num}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(compra.created_at)}
                  </span>
                  <span className='font-bold'>Gran Rifa 2025</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
