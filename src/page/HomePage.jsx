// src/page/HomePage.jsx
import React from 'react';
import { Ticket, Zap, DollarSign, Sparkles, Section } from 'lucide-react';
import PrizeCard from '../components/PrizeCard';
import StatCard from '../components/StatCard';

const HomePage = ({ TICKET_PRICE, setActiveTab }) => {
  const sold = 156;
  const total = 1000;

  return (
    <div className="">
{/* Banner Hero */}
<section className="w-full min-h-screen flex bg-transparent">
  <div
    className="w-full overflow-hidden"
    style={{ background: "linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)" }}
  >
    <div className="relative w-full overflow-hidden">

      {/* Forma decorativa */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hidden md:block absolute right-0 top-0 -translate-y-12 translate-x-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 w-full px-6 md:px-10 lg:px-16 py-16 md:py-24">
        
        {/* CONTENIDO CENTRADO */}
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-center text-center gap-10">

          {/* Texto */}
          <div className="flex flex-col items-center text-center max-w-2xl">
            <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
              Gran Sorteo Anual
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
              ¡Gana una <span className="text-yellow-300">Bera SBR 2025</span>!
            </h2>

            <p className="mt-4 text-lg md:text-xl text-indigo-100">
              La moto más codiciada del año puede ser tuya. Diseño renovado, color azul eléctrico y 0KM. Solo quedan{" "}
              <span className="font-semibold text-white">{total - sold}</span> boletos.
            </p>

            {/* Botones redondos centrados */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveTab("comprar")}
                className="inline-flex items-center justify-center px-6 md:px-8 py-3 rounded-full text-base font-bold text-indigo-900 bg-white shadow-lg transform transition duration-200 hover:scale-105"
              >
                Comprar Boleto (${TICKET_PRICE})
              </button>

              <button
                onClick={() => setActiveTab("oracle")}
                className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-indigo-300/30 bg-indigo-900/40 text-base font-medium text-purple-100 backdrop-blur-sm transform transition duration-200 hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                Números Mágicos IA
              </button>
            </div>
          </div>

          {/* Imagen CENTRADA */}
          <div className="flex items-center justify-center w-full">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
              
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-900/20 to-blue-900/10 opacity-60 pointer-events-none" />

              <img
                src="/moto.png"
                alt="Moto Bera SBR Azul"
                className="relative w-full h-full object-contain drop-shadow-2xl transform transition-transform duration-300 hover:scale-105"
                style={{ maxWidth: 420, maxHeight: 420 }}
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</section>


      <section className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
            description="Azul Eléctrico, 0KM + papeles al día"
            image="/moto.png"
            // color de fondo ligero para resaltar (usar clase tailwind)
            bg="bg-indigo-800"
          />

          <PrizeCard
            variant="second"
            rank="2do"
            title="Smart TV 43'"
            image="/tv.png"
            // bg solo para first; en second no hace falta
          />

          <PrizeCard variant="third" rank="3er" title="$100 Dólares" image="/dolar.png" />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard title="Boletos Vendidos" value={`${sold} / ${total}`} icon={Ticket} color="bg-indigo-500" />
        <StatCard title="Fecha Sorteo" value="31 Diciembre" icon={Zap} color="bg-yellow-500" />
        <StatCard title="Valor del Boleto" value={`$${TICKET_PRICE}`} icon={DollarSign} color="bg-green-500" />
      </div>
      </section>
    </div>
  );
};

export default HomePage;
