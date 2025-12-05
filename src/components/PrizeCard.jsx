// src/components/PrizeCard.jsx
import React from "react";

const PrizeCard = ({ rank, title, description, icon: Icon, color, image }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full transform hover:scale-105 transition-transform duration-300 group">
    <div className={`h-2 ${color}`} />
    <div className="relative flex justify-center items-center pt-8 px-4">
      {image ? (
        <div className="relative w-full h-48 flex items-center justify-center">
          <div
            className={`absolute w-32 h-32 rounded-full ${color.replace(
              "bg-",
              "bg-opacity-20 bg-"
            )} filter blur-xl group-hover:bg-opacity-30 transition-all`}
          ></div>
          <img
            src={image}
            alt={title}
            className="relative z-10 w-auto h-full object-contain drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      ) : (
        <div
          className={`h-32 w-32 rounded-full flex items-center justify-center ${color.replace(
            "bg-",
            "bg-opacity-10 text-"
          )}`}
        >
          {Icon && <Icon className={`h-16 w-16 ${color.replace("bg-", "text-")}`} />}
        </div>
      )}
      <span className="absolute top-4 right-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-800 shadow-sm border border-gray-100 z-20">
        {rank} Lugar
      </span>
    </div>
    <div className="p-6 flex-1 flex flex-col items-center text-center">
      <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  </div>
);

export default PrizeCard;
