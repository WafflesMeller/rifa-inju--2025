// src/components/FloatingCheckoutBar.jsx
import React from "react";
import { ShoppingCart, CheckCircle } from "lucide-react";

const FloatingCheckoutBar = ({
  selectedTickets,
  totalAmount,
  onClear,
  onGoToComprar,
}) => {
  if (selectedTickets.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <div
            className="bg-indigo-100 p-2 rounded-full mr-3 cursor-pointer"
            onClick={onGoToComprar}
          >
            <ShoppingCart className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total a Pagar</p>
            <p className="text-2xl font-bold text-gray-900">
              ${totalAmount}{" "}
              <span className="text-sm font-normal text-gray-500">
                ({selectedTickets.length} boletos)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center w-full sm:w-auto space-x-3">
          <div className="hidden md:flex flex-wrap gap-1 mr-4 max-w-xs justify-end">
            {selectedTickets.slice(0, 5).map((n) => (
              <span
                key={n}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold"
              >
                {n.toString().padStart(3, "0")}
              </span>
            ))}
            {selectedTickets.length > 5 && (
              <span className="text-xs text-gray-400">
                +{selectedTickets.length - 5} más
              </span>
            )}
          </div>
          <button
            onClick={onClear}
            className="flex-1 sm:flex-none px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={() =>
              alert(
                `¡Listo! Procesando compra por $${totalAmount} para los números: ${selectedTickets
                  .map((n) => n.toString().padStart(3, "0"))
                  .join(", ")}`
              )
            }
            className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transform active:scale-95 transition-all flex items-center justify-center"
          >
            Pagar Ahora <CheckCircle className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingCheckoutBar;
