// src/components/TicketCard.jsx
import React from 'react';
import { User, CheckCircle, Sparkles, Calendar } from 'lucide-react';

export default function TicketCard({ compra, active = false }) {

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

  return (
    <div 
      className={`
        group relative bg-white rounded-3xl overflow-hidden transition-all duration-300
        ${active 
          ? '' // ESTADO ACTIVO (Fijo)
          : 'shadow-xl hover:-translate-y-1 hover:shadow-indigo-500/20' // ESTADO NORMAL (Hover)
        }
      `}
    >
      
      {/* Decoración superior */}
      <div className="h-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

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
            <p className="text-xs text-gray-400 font-mono">Recibo #LG2025-{String(compra.id).padStart(3, '0')}</p>
          </div>
        </div>

        {/* Línea divisoria y Muescas */}
        <div className="relative flex items-center justify-center my-6">
          {/* Asegúrate que este color coincida con el fondo de tu página */}
          <div className="absolute -left-10 w-6 h-6 bg-[#161a2c] rounded-full"></div> 
          <div className="w-full border-t-3 border-dashed border-gray-200"></div>
          <div className="absolute -right-10 w-6 h-6 bg-[#161a2c] rounded-full"></div> 
        </div>

        {/* Números Participantes */}
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
                  className={`
                    border rounded-xl px-4 py-2 flex flex-col items-center min-w-20 transition-colors
                    ${active 
                        ? 'bg-indigo-50 border-indigo-200' // Si está activo, se pinta azul fijo
                        : 'bg-gray-50 border-gray-200 group-hover:border-indigo-200 group-hover:bg-indigo-50' // Si no, solo en hover
                    }
                  `}
                >
                  <span className="text-xs text-gray-400 uppercase">Ticket</span>
                  <span 
                    className={`
                      text-2xl font-black tracking-tighter
                      ${active 
                        ? 'text-indigo-600' 
                        : 'text-gray-800 group-hover:text-indigo-600'
                      }
                    `}
                  >
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
  );
}