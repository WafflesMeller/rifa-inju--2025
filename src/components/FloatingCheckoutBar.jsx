// src/components/FloatingCheckoutBar.jsx
import React, { useState, useEffect } from "react";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import ModalConfirm from "./ModalConfirm";

const FloatingCheckoutBar = ({
  selectedTickets = [],
  totalAmount = 0,
  onClear = () => {},
}) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Efecto para mostrar/ocultar basado en si hay tickets
  useEffect(() => {
    setIsVisible(selectedTickets.length > 0);
  }, [selectedTickets]);

  if (!selectedTickets || selectedTickets.length === 0) return null;

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-500 ease-in-out ${
          isVisible ? "translate-y-0" : "translate-y-[150%]"
        }`}
      >
        {/* Contenedor con efecto Glassmorphism (Minimalista) */}
        <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-5px_30px_-10px_rgba(0,0,0,0.1)] px-4 py-3 md:py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            
            {/* IZQUIERDA: Información de precio y cantidad */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 text-indigo-600 mb-0.5">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs font-semibold tracking-wide uppercase">Tu Pedido</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  ${totalAmount}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  x {selectedTickets.length} boletos
                </span>
              </div>
            </div>

            {/* CENTRO (Oculto en móviles muy pequeños): Lista de números sutil */}
            <div className="hidden md:flex flex-1 justify-end px-6 overflow-hidden">
              <div className="flex flex-wrap gap-1.5 justify-end max-w-md">
                {selectedTickets.slice(0, 6).map((n) => (
                  <span
                    key={n}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-mono font-medium border border-gray-200"
                  >
                    #{n.toString().padStart(3, "0")}
                  </span>
                ))}
                {selectedTickets.length > 6 && (
                  <span className="px-2 py-0.5 text-xs text-gray-400 font-medium">
                    +{selectedTickets.length - 6} más
                  </span>
                )}
              </div>
            </div>

            {/* DERECHA: Acciones */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Botón Limpiar (Minimalista: solo icono/texto gris) */}
              <button
                onClick={onClear}
                className="group flex flex-col md:flex-row items-center justify-center text-gray-400 hover:text-red-500 transition-colors p-2"
                title="Limpiar selección"
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden md:block ml-1 text-sm font-medium">Borrar</span>
              </button>

              {/* Botón Principal ÚNICO: Reportar Pago */}
              <button
                onClick={() => setOpenConfirm(true)}
                className="relative overflow-hidden group bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
              >
                <div className="text-left leading-tight">
                  <span className="block text-xs text-indigo-200 font-medium">Finalizar</span>
                  <span className="block text-sm md:text-base font-bold">Reportar Pago</span>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-100 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <ModalConfirm
        isOpen={openConfirm}
        onClose={() => setOpenConfirm(false)}
        selectedTickets={selectedTickets}
        totalAmount={totalAmount}
        // Pasamos onClear si tu modal lo necesita al cerrar exitosamente
        onClear={onClear} 
      />
    </>
  );
};

export default FloatingCheckoutBar;