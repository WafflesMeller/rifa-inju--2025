// src/components/PrizeCard.jsx
import { Star } from 'lucide-react';
import React from 'react';

const PrizeCard = ({ variant = 'second', rank = '2do', title, description, image }) => {
  const isFirst = variant === 'first';

  // Fondo degradado SOLO para el primer premio
  const firstPrizeBg = {
    background: "linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)"
  };

  return (
    <div
      className={`
        rounded-2xl 
        overflow-hidden h-full flex flex-col shadow-sm 
        transform transition-all duration-300 
        hover:shadow-lg hover:scale-[1.05]
        ${isFirst ? ' text-white' : 'bg-white text-gray-900'}
      `}
      style={isFirst ? firstPrizeBg : {}}
      aria-label={`${rank} Premio - ${title}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <div
            className={`
              px-3 py-1 rounded-lg font-semibold text-sm 
              ${isFirst ? 'bg-white text-indigo-800' : 'bg-gray-100 text-gray-700'}
            `}
          >
            {rank} Premio
          </div>
        </div>

        {/* Estrella SOLO en el primer premio */}
        {isFirst ? (
          <div className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-sm shadow flex items-center justify-center">
            <Star className="text-yellow-300" />
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
            className={`object-contain max-h-44 md:max-h-48 transition-transform duration-300 ${
              isFirst ? 'drop-shadow-lg' : ''
            }`}
            style={{ width: 'auto', maxWidth: '90%' }}
          />
        ) : (
          <div className="text-4xl">🎁</div>
        )}
      </div>

      {/* Texto */}
      <div className="px-6 pb-6 text-center">
        <h3 className={`text-lg md:text-xl font-extrabold ${isFirst ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>

        <p className={`mt-2 text-sm ${isFirst ? 'text-indigo-200' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default PrizeCard;
