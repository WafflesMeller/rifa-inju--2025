// src/components/PrizeCard.jsx
import React from "react";

const PrizeCard = ({ variant = "second", rank = "2do", title, description, image }) => {
  const isFirst = variant === "first";

  return (
    <div
      className={`
        rounded-2xl border 
        overflow-hidden h-full flex flex-col shadow-sm 
        transform transition-all duration-300 
        hover:shadow-2xl hover:scale-[1.05]
        ${isFirst ? "bg-indigo-800 border-indigo-700 text-white" : "bg-white border-gray-100 text-gray-900"}
      `}
      aria-label={`${rank} Premio - ${title}`}
    >

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <div
            className={`
              px-3 py-1 rounded-lg font-semibold text-sm 
              ${isFirst ? "bg-white text-indigo-800" : "bg-gray-100 text-gray-700"}
            `}
          >
            {rank} Premio
          </div>
        </div>

        {/* Estrella SOLO en el primer premio */}
        {isFirst ? (
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm shadow flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.39 4.85L19 8l-3.45 3.37L16.79 16 12 13.77 7.21 16l1.24-4.63L5 8l4.61-.15L12 2z" fill="#FACC15"/>
            </svg>
          </div>
        ) : (
          <div className="w-9 h-9" />
        )}
      </div>

      {/* Imagen */}
      <div className="flex-1 flex items-center justify-center px-6 py-6">
        {image ? (
          <img
            src={image}
            alt={title}
            className={`object-contain max-h-44 md:max-h-48 transition-transform duration-300 ${isFirst ? "drop-shadow-lg" : ""}`}
            style={{ width: "auto", maxWidth: "90%" }}
          />
        ) : (
          <div className="text-4xl">🎁</div>
        )}
      </div>

      {/* Texto */}
      <div className="px-6 pb-6 text-center">
        <h3 className={`text-lg md:text-xl font-extrabold ${isFirst ? "text-white" : "text-gray-900"}`}>
          {title}
        </h3>

        <p className={`mt-2 text-sm ${isFirst ? "text-indigo-200" : "text-gray-500"}`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default PrizeCard;
