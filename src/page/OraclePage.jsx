// src/page/OraclePage.jsx
import React, { useState } from "react";
import { Sparkles, BrainCircuit, Loader2, Ticket } from "lucide-react";
import { callGeminiOracle } from "../services/geminiOracle";

const OraclePage = ({ onAddNumbers, soldTickets }) => {
  const [inputContext, setInputContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  // Nuevo estado para rastrear visualmente los seleccionados en esta sesión
  const [selectedInSession, setSelectedInSession] = useState(new Set());

  const handleConsult = async () => {
    if (!inputContext.trim()) return;
    setLoading(true);
    setPrediction(null);
    // Reiniciamos la selección visual al hacer una nueva consulta
    setSelectedInSession(new Set());
    const result = await callGeminiOracle(inputContext);
    setLoading(false);
    if (result) {
      setPrediction(result);
    }
  };

  return (
    // CAMBIO 1: Contenedor principal ocupa toda la pantalla, tiene el fondo y centra el contenido
    <div className="min-h-screen w-full  flex items-center justify-center overflow-hidden relative text-white p-4"
    style={{ background: 'linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)' }}>

      {/* Contenedor del contenido centrado */}
      <div className="max-w-3xl w-full relative z-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm border border-white/20">
          <Sparkles className="h-8 w-8 text-yellow-300 mr-2" />
          <BrainCircuit className="h-6 w-6 text-purple-200" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-serif">
          El Oráculo de la Suerte
        </h2>
        <p className="text-indigo-200 mb-8 max-w-xl mx-auto text-lg">
          ¿No sabes qué número elegir? Cuéntale a la IA tu sueño de anoche, tu
          fecha de nacimiento o simplemente cómo te sientes hoy. El Oráculo
          interpretará las señales.
        </p>

        {!prediction ? (
          <div className="space-y-4 max-w-md mx-auto">
            <textarea
              value={inputContext}
              onChange={(e) => setInputContext(e.target.value)}
              placeholder="Ej: Soñé que ganaba la moto y viajaba a la playa..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white/20 transition-all h-32 resize-none shadow-inner"
            />
            <button
              onClick={handleConsult}
              disabled={loading || !inputContext.trim()}
              className="w-full py-3 bg-linear-to-r from-yellow-400 to-yellow-600 text-indigo-900 font-bold rounded-xl hover:from-yellow-300 hover:to-yellow-500 transition-all shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <Sparkles className="h-5 w-5 mr-2" />
              )}
              {loading ? "Consultando a los astros..." : "Revelar mis Números"}
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6 shadow-xl">
              <p className="text-xl font-medium text-yellow-300 mb-4 italic">
                "{prediction.message}"
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {prediction.numbers.map((num) => {
                  const isSold = soldTickets.has(num);
                  // CAMBIO 2: Verificar si ya fue seleccionado en esta sesión
                  const isSelected = selectedInSession.has(num);

                  // Lógica de estilos basada en los 3 estados (Vendido, Seleccionado, Disponible)
                  let buttonStyles = "";
                  if (isSold) {
                    buttonStyles =
                      "bg-gray-800/50 border-gray-600 opacity-50 cursor-not-allowed text-gray-400";
                  } else if (isSelected) {
                    // CAMBIO 3: Estilo "rellenado" cuando se selecciona
                    buttonStyles =
                      "bg-yellow-400 border-yellow-400 scale-105 cursor-default text-indigo-900 shadow-lg shadow-yellow-400/20";
                  } else {
                    buttonStyles =
                      "bg-white/20 border-yellow-400 hover:bg-yellow-400 hover:border-yellow-300 hover:scale-110 cursor-pointer text-white hover:text-indigo-900";
                  }

                  return (
                    <button
                      key={num}
                      onClick={() => {
                        // Solo actuar si no está vendido y no ha sido seleccionado aún
                        if (!isSold && !isSelected) {
                          onAddNumbers(num);
                          // Añadir al estado local para feedback visual
                          setSelectedInSession((prev) =>
                            new Set(prev).add(num)
                          );
                        }
                      }}
                      disabled={isSold || isSelected}
                      className={`group relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 transition-all duration-300 ${buttonStyles}`}
                    >
                      <span className="text-2xl font-bold">
                        {num.toString().padStart(3, "0")}
                      </span>
                      <span
                        className={`text-xs mt-1 font-medium ${
                          isSold
                            ? ""
                            : isSelected
                            ? "text-indigo-800/70"
                            : "text-yellow-200 group-hover:text-indigo-800"
                        }`}
                      >
                        {isSold
                          ? "Vendido"
                          : isSelected
                          ? "Agregado"
                          : "Agregar"}
                      </span>
                      {!isSold && !isSelected && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-indigo-900 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                          <Ticket className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => {
                setPrediction(null);
                setInputContext("");
              }}
              className="text-indigo-200 hover:text-white underline text-sm cursor-pointer transition-colors"
            >
              Consultar otra vez
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OraclePage;