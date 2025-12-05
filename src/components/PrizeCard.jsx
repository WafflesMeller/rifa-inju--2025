// src/components/PrizeCard.jsx
import React from "react";
import { Crown, Star, Medal } from "lucide-react"; // usa lucide o tus icons

/**
 * Props:
 * - variant: 'first' | 'second' | 'third' (añade tamaño y estilo de podio)
 * - rank: string ("1er", "2do", "3er")
 * - title, description, image, color (bg color base como "bg-yellow-500")
 */
const PrizeCard = ({
  variant = "first",
  rank = "1er",
  title,
  description,
  image,
  color = "bg-blue-600",
}) => {
  // tamaño y profundidad según variante
  const sizes = {
    first: { card: "md:h-96 h-96", img: "h-44", scale: "scale-105", z: "z-20" },
    second: { card: "md:h-80 h-80", img: "h-36", scale: "scale-100", z: "z-10" },
    third: { card: "md:h-72 h-72", img: "h-32", scale: "scale-95", z: "z-0" },
  };

  const s = sizes[variant];

  // medal / crown icon
  const IconBadge = () => {
    if (variant === "first") return <Crown className="h-5 w-5" />;
    if (variant === "second") return <Star className="h-5 w-5" />;
    return <Medal className="h-5 w-5" />;
  };

  return (
    <div
      className={`relative ${s.card} rounded-3xl overflow-visible transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${s.scale}`}
      aria-label={`${rank} premio ${title}`}
    >
      {/* Podio base (sombra y barra inferior) */}
      <div className="absolute inset-x-0 -bottom-6 flex justify-center pointer-events-none">
        <div
          className={`w-3/4 h-12 rounded-2xl ${variant === "first" ? "bg-gradient-to-r from-yellow-400 to-amber-500" : variant === "second" ? "bg-gradient-to-r from-indigo-400 to-purple-500" : "bg-gradient-to-r from-green-400 to-emerald-500"} opacity-90 shadow-2xl`}
        />
      </div>

      {/* Card interior */}
      <div className={`relative h-full rounded-2xl border border-gray-100 bg-white flex flex-col items-center text-center p-6 ${s.z} overflow-hidden`}>
        {/* Decorative glow */}
        <div
          className={`absolute -top-10 -left-10 w-52 h-52 rounded-full blur-3xl opacity-30 ${color}`}
          style={{ filter: "blur(40px)" }}
        />

        {/* Ribbon + big rank */}
        <div className="absolute top-4 left-4 flex items-center gap-3">
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-white font-extrabold ${color} shadow-md`}>
            <span className="text-sm">{rank}</span>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Lugar</div>
        </div>

        {/* Badge superior (medalla o corona) */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="bg-white/80 p-2 rounded-full shadow-sm">
            <IconBadge />
          </div>
        </div>

        {/* Imagen con halo y etiqueta "Premio" */}
        <div className="relative mt-6 flex items-center justify-center">
          <div
            className={`absolute w-40 h-40 rounded-full ${color} opacity-20 animate-pulse-slow`}
            style={{ filter: "blur(28px)" }}
          />
          <div className="relative z-10 flex items-center justify-center rounded-full bg-white p-2 shadow-lg">
            {image ? (
              <img
                src={image}
                alt={title}
                className={`object-contain ${s.img} transition-transform duration-700 hover:scale-110`}
                style={{ maxHeight: 180 }}
              />
            ) : (
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${color} text-white font-bold`}>
                🎁
              </div>
            )}
          </div>
        </div>

        {/* Texto */}
        <div className="mt-6 px-2 w-full">
          <h4 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">{title}</h4>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>

        {/* Footer: precio / etiqueta resaltada */}
        <div className="mt-auto w-full flex items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${color} text-white shadow-sm`}>
              {variant === "first" ? "Premio Principal" : variant === "second" ? "Segundo Premio" : "Tercer Premio"}
            </div>
            <div className="text-xs text-gray-400">¡No necesitas boleto extra!</div>
          </div>

          {/* botón/CTA pequeño */}
          <div>
            <button
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm shadow-sm hover:shadow-md`}
            >
              Ver
            </button>
          </div>
        </div>
      </div>

      {/* Small floating sparkle (subtle) */}
      <div className="pointer-events-none absolute -top-6 left-1/2 transform -translate-x-1/2">
        <svg width="48" height="18" viewBox="0 0 48 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="24" cy="9" rx="24" ry="9" fill="rgba(255,255,255,0.06)"/>
        </svg>
      </div>

      {/* Inline small styles for animation (Tailwind + custom) */}
      <style jsx>{`
        @keyframes pulseSlow {
          0% { transform: scale(0.98); opacity: 0.22; }
          50% { transform: scale(1); opacity: 0.32; }
          100% { transform: scale(0.98); opacity: 0.22; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 3.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PrizeCard;
