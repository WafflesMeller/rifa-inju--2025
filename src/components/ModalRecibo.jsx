// src/components/ModalRecibo.jsx
import React from 'react';
import { Check } from 'lucide-react';

export default function ModalRecibo({ isOpen, data, onClose }) {
  if (!isOpen || !data) return null;

  return (
    // Z-INDEX 99999 para estar ENCIMA de todo (incluso del otro modal)
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      
      {/* Fondo oscuro */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Tarjeta del Recibo */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Encabezado Verde */}
        <div className="bg-emerald-600 p-6 text-center text-white">
           <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg">
             <Check className="w-8 h-8 text-emerald-600" strokeWidth={3} />
           </div>
           <h2 className="text-2xl font-bold">¡Pago Confirmado!</h2>
           <p className="text-emerald-100 text-sm">Tu ID de recibo: #{data.id}</p>
        </div>

        {/* Cuerpo del Recibo */}
        <div className="p-6 space-y-4">
          <div className="text-center border-b border-gray-100 pb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Monto Total</p>
            <p className="text-3xl font-black text-slate-800">
              {data.monto_bs ? `Bs. ${data.monto_bs}` : 'Pagado'}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl space-y-2">
             <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cliente:</span>
                <span className="font-bold">{data.nombre_cliente}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tickets:</span>
                <span className="font-bold text-indigo-600">{data.tickets.join(", ")}</span>
             </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}