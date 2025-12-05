// src/components/PrizeCard.jsx
import React from "react";

/**
 * Props:
 * - variant: 'first' | 'second' | 'third'
 * - rank: string ("1er", "2do", "3er")
 * - title, description, image
 * - bg (opcional): background color clase tailwind para destacar (ej: "bg-amber-400")
 *
 * Comportamiento: no halos, imagen centrada, etiqueta superior "X Premio",
 * sin botón, sin iconos a la derecha salvo si variant === 'first' -> se muestra una estrella.
 */
const PrizeCard = ({ variant = "second", rank = "2do", title, description, image, bg = "" }) => {
  // fondo especial solo para el primer premio (opcional)
  const bgClass = variant === "first" ? bg || "bg-amber-400/10" : "bg-white";

  return (
    <div
      className={`rounded-2xl border ${variant === "first" ? "border-amber-300" : "border-gray-100"} ${bgClass} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col`}
      role="article"
      aria-label={`${rank} Premio - ${title}`}
    >
      {/* Header: etiqueta "X Premio" */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className={`inline-flex items-center gap-3`}>
          <div
            className={`px-3 py-1 rounded-lg font-semibold text-sm ${variant === "first" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            {rank} Premio
          </div>
        </div>

        {/* Solo mostrar icono pequeño en la primera card */}
        {variant === "first" ? (
          <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center mr-1">
            {/* estrella simple svg */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2l2.39 4.85L19 8l-3.45 3.37L16.79 16 12 13.77 7.21 16l1.24-4.63L5 8l4.61-.15L12 2z" fill="#f59e0b"/>
            </svg>
          </div>
        ) : (
          <div className="w-9 h-9" /> /* placeholder para mantener simetría */
        )}
      </div>

      {/* Imagen centrada (sin fondos redondos ni halos) */}
      <div className="flex-1 flex items-center justify-center px-6 py-6">
        {image ? (
          <img
            src={image}
            alt={title}
            className="object-contain max-h-44 md:max-h-48"
            style={{ width: "auto", maxWidth: "90%" }}
          />
        ) : (
          <div className="text-4xl">🎁</div>
        )}
      </div>

      {/* Texto */}
      <div className="px-6 pb-6">
        <h3 className="text-lg md:text-xl font-extrabold text-gray-900 text-center">{title}</h3>
        <p className="mt-2 text-sm text-gray-500 text-center">{description}</p>
      </div>
    </div>
  );
};

export default PrizeCard;
