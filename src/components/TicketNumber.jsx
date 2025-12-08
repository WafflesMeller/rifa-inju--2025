// src/components/TicketNumber.jsx
import React from "react";

const TicketNumber = ({ number, status, onSelect }) => {
  const formattedNumber = number.toString().padStart(3, "0");

  const baseClasses =
    "h-10 w-full rounded-xl text-sm font-bold flex items-center justify-center transition-all duration-300 select-none border";

  let statusClasses = "";

  if (status === "sold" || status === "vendido") {
    // 🌑 VENDIDO: Gris más oscuro y texto hundido.
    // El 'bg-gray-200' contrasta mucho más con el blanco de los disponibles.
    statusClasses =
      "bg-gray-200 text-gray-400 border-transparent cursor-not-allowed"; 

  } else if (status === "selected") {
    // 🟣 SELECCIONADO: Color sólido, sin escala.
    statusClasses =
      "bg-indigo-600 text-white border-indigo-600 cursor-pointer z-10 ring-2 ring-indigo-600 ring-offset-2";

  } else {
    // ⚪ DISPONIBLE: Fondo blanco brillante y borde más definido.
    // Agregamos 'border-gray-300' para que el recuadro se vea más nítido.
    statusClasses =
      "bg-white text-gray-700 hover:shadow-md hover:border-indigo-500 hover:text-indigo-600 hover:scale-110 cursor-pointer";
  }

  return (
    <div
      onClick={() => {
        if (status !== "sold" && status !== "vendido") {
          onSelect(number);
        }
      }}
      className={`${baseClasses} ${statusClasses}`}
    >
      {formattedNumber}
    </div>
  );
};

export default TicketNumber;