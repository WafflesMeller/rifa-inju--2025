// src/components/TicketNumber.jsx
import React from "react";

const TicketNumber = ({ number, status, onSelect }) => {
  const formattedNumber = number.toString().padStart(3, "0");

  let baseClasses =
    "h-10 w-full rounded text-sm font-bold flex items-center justify-center transition-all duration-200 select-none cursor-pointer border";
  let statusClasses = "";

  if (status === "sold" || status === "vendido") {
    // 🟠 CAMBIO AQUÍ: Agregamos 'opacity-60' para el efecto deshabilitado
    // Mantenemos el borde y texto naranja, pero todo se ve más "apagado"
    statusClasses =
      "bg-gray-50 text-orange-500 border-orange-400 cursor-not-allowed opacity-60"; 
  } else if (status === "selected") {
    // 🟣 Seleccionado
    statusClasses =
      "bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-110 z-10";
  } else {
    // ⚪ Disponibles
    statusClasses =
      "bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:text-indigo-600";
  }

  return (
    <div
      onClick={() => status !== "sold" && status !== "vendido" && onSelect(number)}
      className={`${baseClasses} ${statusClasses}`}
    >
      {formattedNumber}
    </div>
  );
};

export default TicketNumber;