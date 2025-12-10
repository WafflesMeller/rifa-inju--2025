/// src/components/PrizeCard.jsx
import { Star, Medal, Trophy } from 'lucide-react';
import React from 'react';

// 1. AÑADIR 'onClick' a las props
const PrizeCard = ({ variant = 'second', rank = '2do', title, description, image, onClick }) => {
  const isFirst = variant === 'first';
  
  const isSecond = variant === 'second' || rank.includes('2');
  const isThird = variant === 'third' || rank.includes('3');

  // Estilos dinámicos para las etiquetas (Badges)
  const getBadgeStyle = () => {
    if (isFirst) return 'bg-white text-indigo-800 shadow-sm';
    if (isSecond) return 'bg-slate-100 text-slate-600 border border-slate-200';
    if (isThird) return 'bg-orange-50 text-orange-700 border border-orange-200';
    return 'bg-gray-100 text-gray-700'; 
  };

  // Fondo degradado SOLO para el primer premio
  const firstPrizeBg = {
    background: "linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)"
  };

  return (
    {/* 2. ENVOLVER en un elemento clickeable y aplicar estilos de cursor/interactividad */}
    <div
      onClick={onClick} // <-- Ejecuta la función pasada (setActiveTab('comprar'))
      className={`
        relative group
        rounded-3xl 
        overflow-hidden h-full flex flex-col 
        transform transition-all duration-300 
        hover:scale-[1.02]
        cursor-pointer // <-- Añadir cursor-pointer para indicar que es clickeable
        ${isFirst 
          ? 'text-white shadow-xl shadow-indigo-900/20' 
          : 'bg-white text-gray-900 shadow-lg border border-gray-100 hover:border-indigo-100 hover:shadow-xl'
        }
      `}
      style={isFirst ? firstPrizeBg : {}}
    >
      {/* Resto del contenido del PrizeCard... (sin cambios) */}

      {/* Efecto de brillo sutil en hover para 2do y 3ro */}
      {!isFirst && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 relative z-10">
        {/* ... */}
      </div>

      {/* Imagen */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
        {/* ... */}
      </div>

      {/* Texto */}
      <div className="px-6 pb-8 text-center relative z-10">
        {/* ... */}
      </div>
    </div>
  );
};

export default PrizeCard;