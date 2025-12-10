// src/components/PrizeCard.jsx
import { Star, Medal, Trophy } from 'lucide-react';
import React from 'react';

const PrizeCard = ({ variant = 'second', rank = '2do', title, description, image, onClick }) => {
  const isFirst = variant === 'first';
  
  // Lógica de colores según el puesto (puedes ajustar 'second' y 'third' si usas otras variantes)
  const isSecond = variant === 'second' || rank.includes('2');
  const isThird = variant === 'third' || rank.includes('3');

  // Estilos dinámicos para las etiquetas (Badges)
  const getBadgeStyle = () => {
    if (isFirst) return 'bg-white text-indigo-800 shadow-sm';
    if (isSecond) return 'bg-slate-100 text-slate-600 border border-slate-200'; // Estilo Plata
    if (isThird) return 'bg-orange-50 text-orange-700 border border-orange-200'; // Estilo Bronce
    return 'bg-gray-100 text-gray-700'; // Default
  };

  // Fondo degradado SOLO para el primer premio
  const firstPrizeBg = {
    background: "linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)"
  };

   return (
    <div
      onClick={onClick} 
      className={`
        relative group
        rounded-3xl 
        overflow-hidden h-full flex flex-col 
        transform transition-all duration-300 
        hover:scale-[1.02]
        ${onClick ? 'cursor-pointer' : ''}  // Agregamos cursor-pointer si tiene un onClickreturn (
        ${isFirst 
          ? 'text-white shadow-xl shadow-indigo-900/20' 
          : 'bg-white text-gray-900 shadow-lg border border-gray-100 hover:border-indigo-100 hover:shadow-xl'
        }
      `}
      style={isFirst ? firstPrizeBg : {}}
    >
      {/* Efecto de brillo sutil en hover para 2do y 3ro */}
      {!isFirst && (
        <div onClick={onClick}  className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none " />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 relative z-10">
        <div>
          <div
            className={`
              px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider
              ${getBadgeStyle()}
            `}
          >
            {rank} Premio
          </div>
        </div>

        {/* Iconos según el rango */}
        <div className={`
            w-10 h-10 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md
            ${isFirst ? 'bg-white/20 text-yellow-300' : 'bg-gray-50 border border-gray-100'}
        `}>
          {isFirst && <Star className="w-5 h-5 fill-yellow-300" />}
          {isSecond && <Medal className="w-5 h-5 text-slate-400" />} {/* Plata */}
          {isThird && <Medal className="w-5 h-5 text-amber-600" />}  {/* Bronce */}
          {!isFirst && !isSecond && !isThird && <Trophy className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {/* Imagen */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
        {/* Círculo decorativo de fondo para la imagen en 2do y 3ro */}
        {!isFirst && (
          <div className="absolute w-32 h-32 bg-gray-50 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" />
        )}
        
        {image ? (
          <img
            src={image}
            alt={title}
            className={`
              object-contain max-h-40 md:max-h-48 z-10 transition-transform duration-500 group-hover:scale-110
              ${isFirst ? 'drop-shadow-2xl' : 'drop-shadow-xl'}
            `}
            style={{ width: 'auto', maxWidth: '100%' }}
          />
        ) : (
          <div className={`text-6xl ${isThird ? 'text-amber-500 animate-spin-slow' : 'text-gray-400 animate-bounce'}`}>
            
          </div>
        )}
      </div>

      {/* Texto */}
      <div className="px-6 pb-8 text-center relative z-10">
        <h3 className={`text-lg md:text-xl font-bold leading-tight ${isFirst ? 'text-white' : 'text-slate-800'}`}>
          {title}
        </h3>

        <div className={`h-1 w-12 mx-auto my-3 rounded-full ${isFirst ? 'bg-indigo-400' : 'bg-gray-200'}`} />

        <p className={`text-sm font-medium ${isFirst ? 'text-indigo-200' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default PrizeCard;