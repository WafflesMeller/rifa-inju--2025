// src/components/FloatingCheckoutBar.jsx
import React, { useState } from "react";
import { ShoppingCart, CheckCircle } from "lucide-react";
import BottomSheetConfirm from "./BottomSheetConfirm";

const FloatingCheckoutBar = ({
  selectedTickets = [],
  totalAmount = 0,
  onClear = () => {},
  onGoToComprar = null, // si lo pasas, el botón "Pagar Ahora" lo ejecuta (igual que antes)
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!selectedTickets || selectedTickets.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full bg-white/70 backdrop-blur-lg p-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          {/* Lado izquierdo: icono + total */}
          <div className="flex items-center mb-4 sm:mb-0">
            <div
              className="bg-indigo-100 p-2 rounded-full mr-3 cursor-pointer"
              title="Resumen"
              onClick={() => {
                // podrías abrir el sheet aquí si prefieres
                setSheetOpen(true);
              }}
            >
              <ShoppingCart className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total a Pagar</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalAmount}{" "}
                <span className="text-sm font-normal text-gray-500">({selectedTickets.length} boletos)</span>
              </p>
            </div>
          </div>

          {/* Lado derecho: lista pequeña + botones */}
          <div className="flex items-center w-full sm:w-auto space-x-3">
            <div className="hidden md:flex flex-wrap gap-1 mr-4 max-w-xs justify-end">
              {selectedTickets.slice(0, 5).map((n) => (
                <span key={n} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                  {n.toString().padStart(3, "0")}
                </span>
              ))}
              {selectedTickets.length > 5 && (
                <span className="text-xs text-gray-400">+{selectedTickets.length - 5} más</span>
              )}
            </div>

            {/* Limpiar */}
            <button
              onClick={onClear}
              className="flex-1 sm:flex-none px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>

            {/* Reportar Pago -> abre BottomSheet */}
            <button
              onClick={() => setSheetOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition"
              title="Reportar Pago"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              Reportar Pago
            </button>

            {/* Pagar Ahora -> dejo como estaba, llama a onGoToComprar si existe */}
            <button
              onClick={() => {
                if (typeof onGoToComprar === "function") onGoToComprar();
              }}
              className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transform active:scale-95 transition-all flex items-center justify-center"
            >
              Pagar Ahora
            </button>
          </div>
        </div>
      </div>

      {/* Bottom sheet para reportar pago */}
      <BottomSheetConfirm
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedTickets={selectedTickets}
        totalAmount={totalAmount}
        onClear={onClear}
      />
    </>
  );
};

export default FloatingCheckoutBar;
