// src/page/HomePage.jsx
import React from "react";
import { Ticket, Zap, DollarSign, Sparkles } from "lucide-react";
import PrizeCard from "../components/PrizeCard";
import StatCard from "../components/StatCard";

const HomePage = ({ TICKET_PRICE, setActiveTab }) => {
  const sold = 156;
  const total = 1000;

  return (
    <div className="space-y-8 px-4 sm:px-0 font-poppins">
      {/* Banner Hero */}
      <div className="relative bg-indigo-800 rounded-2xl shadow-xl overflow-hidden text-center sm:text-left">
        <div className="absolute inset-0 bg-linear-to-r from-blue-900 to-indigo-700 opacity-95"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>

        <div className="relative p-8 sm:p-12 z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white space-y-4 max-w-2xl text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold uppercase tracking-wide mb-2">
              Gran Sorteo Anual
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              ¡Gana una <span className="text-yellow-300">Bera SBR 2025</span>!
            </h2>
            <p className="text-lg text-indigo-100 max-w-lg mx-auto md:mx-0">
              La moto más codiciada del año puede ser tuya. Diseño renovado,
              color azul eléctrico y 0KM. Solo quedan {total - sold} boletos.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => setActiveTab("comprar")}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-lg text-indigo-900 bg-white hover:bg-indigo-50 transition-all shadow-lg transform hover:-translate-y-1"
              >
                Comprar Boleto (${TICKET_PRICE})
              </button>
              <button
                onClick={() => setActiveTab("oracle")}
                className="inline-flex items-center justify-center px-6 py-3 border border-indigo-300/30 bg-indigo-900/50 text-base font-medium rounded-lg text-purple-100 hover:bg-indigo-900/70 transition-all backdrop-blur-sm"
              >
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                Números Mágicos IA
              </button>
            </div>
          </div>

          {/* Imagen Hero - Moto */}
          <div className="mt-10 md:mt-0 relative w-full md:w-1/2 flex justify-center">
            <div className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500 rounded-full filter blur-[60px] opacity-40"></div>
              <img
                src="/moto.png"
                alt="Moto Bera SBR Azul"
                className="relative w-full object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duración-500"
                style={{
                  filter:
                    "drop-shadow(0 20px 30px rgba(0,0,0,0.5))",
                }}
              />
            </div>
          </div>
        </div>
      </div>

{/* Premios: 3 cards al mismo nivel */}
<div className="pt-10 pb-8">
  <div className="text-center mb-8">
    <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900">Premios Increíbles</h3>
    <p className="mt-2 text-gray-500 text-lg">Tres oportunidades de ganar con tu mismo boleto</p>
  </div>

      {/* Grid responsivo: 1col en mobile, 3 cols en md+ */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
    <PrizeCard
      variant="first"
      rank="1er"
      title="Moto SBR 2026"
      description="Azul Eléctrico, 0KM, papeles al día + Casco certificado."
      image="/moto.png"
      // color de fondo ligero para resaltar (usar clase tailwind)
      bg="bg-indigo-800"
    />

    <PrizeCard
      variant="second"
      rank="2do"
      title="Smart TV 43'"
      description="Samsung Crystal UHD 4K, Smart Hub, Bluetooth."
      image="/tv.png"
      // bg solo para first; en second no hace falta
    />

    <PrizeCard
      variant="third"
      rank="3er"
      title="$100 Dólares"
      description="En efectivo"
      image="https://em-content.zobj.net/source/apple/118/banknote-with-dollar-sign_1f4b5.png"
    />
  </div>
</div>


      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Boletos Vendidos"
          value={`${sold} / ${total}`}
          icon={Ticket}
          color="bg-indigo-500"
        />
        <StatCard
          title="Fecha Sorteo"
          value="31 Diciembre"
          icon={Zap}
          color="bg-yellow-500"
        />
        <StatCard
          title="Valor del Boleto"
          value={`$${TICKET_PRICE}`}
          icon={DollarSign}
          color="bg-green-500"
        />
      </div>
    </div>
  );
};

export default HomePage;
