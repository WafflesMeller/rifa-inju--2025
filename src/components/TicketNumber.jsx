// src/components/TicketNumber.jsx
import React from "react";

const TicketNumber = ({ number, status, onSelect }) => {
  const formattedNumber = number.toString().padStart(3, "0");

  let baseClasses =
    "h-10 w-full rounded text-sm font-bold flex items-center justify-center transition-all duration-200 select-none cursor-pointer border";
  let statusClasses = "";

  if (status === "sold") {
    statusClasses =
      "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed";
  } else if (status === "selected") {
    statusClasses =
      "bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-110 z-10";
  } else {
    statusClasses =
      "bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:text-indigo-600";
  }

  return (
    <div
      onClick={() => status !== "sold" && onSelect(number)}
      className={`${baseClasses} ${statusClasses}`}
    >
      {formattedNumber}
    </div>
  );
};

export default TicketNumber;
