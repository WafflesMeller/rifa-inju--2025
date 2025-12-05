// src/page/OraclePage.jsx
import React, { useState } from "react";
import { Sparkles, BrainCircuit, Loader2, Ticket } from "lucide-react";
import { callGeminiOracle } from "../services/geminiOracle";

const OraclePage = ({ onAddNumbers, soldTickets }) => {
  const [inputContext, setInputContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handleConsult = async () => {
    if (!inputContext.trim()) return;
    setLoading(true);
    setPrediction(null);
    const result = await callGeminiOracle(inputContext);
    setLoading(false);
    if (result) {
      setPrediction(result);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      <div className="bg-linear-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl shadow-2xl overflow-hidden text-white relative">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm border border-white/20">
            <Sparkles className="h-8 w-8 text-yellow-300 mr-2" />
            <BrainCircuit className="h-6 w-6 text-purple-200" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-serif">
            El Oráculo de la Suerte
          </h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto text-lg">
            ¿No sabes qué número elegir? Cuéntale a la IA tu sueño de anoche,
            tu fecha de nacimiento o simplemente cómo te sientes hoy. El
            Oráculo interpretará las señales.
          </p>

          {!prediction ? (
            <div className="space-y-4 max-w-md mx-auto">
              <textarea
                value={inputContext}
                onChange={(e) => setInputContext(e.target.value)}
                placeholder="Ej: Soñé que ganaba la moto y viajaba a la playa..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white/20 transition-all h-32 resize-none"
              />
              <button
                onClick={handleConsult}
                disabled={loading || !inputContext.trim()}
                className="w-full py-3 bg-linear-to-r from-yellow-400 to-yellow-600 text-indigo-900 font-bold rounded-xl hover:from-yellow-300 hover:to-yellow-500 transition-all shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
                <p className="text-xl font-medium text-yellow-300 mb-4 italic">
                  "{prediction.message}"
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {prediction.numbers.map((num) => {
                    const isSold = soldTickets.has(num);
                    return (
                      <button
                        key={num}
                        onClick={() => !isSold && onAddNumbers(num)}
                        disabled={isSold}
                        className={`group relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 transition-all ${
                          isSold
                            ? "bg-gray-800/50 border-gray-600 opacity-50 cursor-not-allowed"
                            : "bg-white/20 border-yellow-400 hover:bg-yellow-400 hover:border-yellow-300 hover:scale-110 cursor-pointer"
                        }`}
                      >
                        <span
                          className={`text-2xl font-bold ${
                            isSold
                              ? "text-gray-400"
                              : "text-white group-hover:text-indigo-900"
                          }`}
                        >
                          {num.toString().padStart(3, "0")}
                        </span>
                        <span
                          className={`text-xs mt-1 ${
                            isSold
                              ? "text-gray-500"
                              : "text-yellow-200 group-hover:text-indigo-800"
                          }`}
                        >
                          {isSold ? "Vendido" : "Agregar"}
                        </span>
                        {!isSold && (
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
                className="text-indigo-200 hover:text-white underline text-sm"
              >
                Consultar otra vez
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OraclePage;
