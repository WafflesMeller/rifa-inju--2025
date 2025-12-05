// src/page/HomePage.jsx
import React from 'react';
// imports en el archivo del Hero (arriba)
import { Sparkles } from 'lucide-react';
import { Ticket, CalendarDays, CircleDollarSign } from 'lucide-react';

import PrizeCard from '../components/PrizeCard';
import StatCounter from '../components/StatCounter';

const HomePage = ({ TICKET_PRICE, setActiveTab, totalSold, totalTickets }) => {
  const sold = totalSold || 0; 
  const total = totalTickets || 1000;
  const percentage = Math.round((sold / total) * 100);

  return (
    <div>
      <section className="w-full min-h-screen flex flex-col bg-transparent">
        <div
          className="w-full flex-1 overflow-hidden"
          style={{ background: 'linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)' }}
        >
          <div className="relative w-full h-full overflow-hidden">
            {/* decorativo */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="hidden md:block absolute right-0 top-0 -translate-y-12 translate-x-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            </div>

            {/* Contenedor principal: flex-col y justify-between */}
            <div className="relative z-10 w-full px-6 md:px-10 lg:px-16 py-12 md:py-16 h-full flex flex-col justify-between">
              {/* MAIN CONTENT (arriba) */}
              <div className="mx-auto w-full max-w-7xl flex flex-col items-center text-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:text-left">
                {/* IZQ: texto y (en sm/md) imagen encima de los botones */}
                <div className="flex-1 max-w-2xl">
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                      Gran Sorteo Anual
                    </span>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
                      ¡Gana una <span className="text-yellow-300">Bera SBR 2025</span>!
                    </h2>

                    <p className="mt-4 text-lg md:text-xl text-indigo-100">
                      La moto más codiciada del año puede ser tuya. Diseño renovado, color azul eléctrico y 0KM. Solo
                      quedan <span className="font-semibold text-white">{total - sold}</span> boletos.
                    </p>

                    {/* ---------------------------
                  Imagen móvil/mediana:
                  visible solo en sm/md (encima de botones)
                 --------------------------- */}
                    <div className="lg:hidden w-full flex items-center justify-center mt-6 mb-2">
                      <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-linear-to-br from-indigo-900/15 to-blue-900/05 opacity-60 pointer-events-none" />
                        <img
                          src="/moto.png"
                          alt="Moto Bera SBR Azul"
                          className="w-full h-full object-contain drop-shadow-2xl transform transition-transform duration-300 hover:scale-105"
                          style={{ maxWidth: 320, maxHeight: 320 }}
                        />
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <button
                        onClick={() => setActiveTab('comprar')}
                        className="inline-flex items-center justify-center px-6 md:px-8 py-3 rounded-full text-base font-bold text-indigo-900 bg-white shadow-lg transform transition duration-200 hover:scale-105"
                      >
                        Comprar Boleto ({TICKET_PRICE})
                      </button>

                      <button
                        onClick={() => setActiveTab('oracle')}
                        className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-indigo-300/30 bg-indigo-900/40 text-base font-medium text-purple-100 backdrop-blur-sm transform transition duration-200 hover:scale-105"
                      >
                        <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                        Números Mágicos IA
                      </button>
                    </div>
                  </div>
                </div>

                {/* DERECHA: imagen (solo visible en lg+) */}
                <div className="flex-1 w-full flex items-center justify-center lg:justify-end">
                  <div className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 items-center justify-center hidden lg:flex">
                    <div className="absolute inset-0 rounded-full bg-linear-to-br from-indigo-900/20 to-blue-900/10 opacity-60 pointer-events-none" />

                    <img
                      src="/moto.png"
                      alt="Moto Bera SBR Azul"
                      className="relative w-full h-full object-contain drop-shadow-2xl transform transition-transform duration-300 hover:scale-105"
                      style={{ maxWidth: 420, maxHeight: 420 }}
                    />
                  </div>
                </div>
              </div>

              {/* COUNTERS: parte inferior (igual que antes) */}
              <div className="w-full mt-6">
                <div className="mx-auto max-w-8xl px-0">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
                    <div className="px-2">
                      <StatCounter
                        title="Boletos Vendidos"
                        value={
                          <span>
                            {sold} <span className="text-sm text-white/70">/ {total}</span>
                          </span>
                        }
                        icon={Ticket}
                        color="bg-indigo-500"
                        progress={total ? sold / total : 0}
                        hint={`Quedan ${Math.max(0, total - sold)} boletos`}
                      />
                    </div>

                    <div className="px-2">
                      <StatCounter
                        title="Fecha Sorteo"
                        value="31 Diciembre"
                        icon={CalendarDays}
                        color="bg-yellow-500"
                        hint="¡No te lo pierdas!"
                      />
                    </div>

                    <div className="px-2">
                      <StatCounter
                        title="Valor del Boleto"
                        value={`${TICKET_PRICE}`}
                        icon={CircleDollarSign}
                        color="bg-green-500"
                        hint="A tasa Euro BCV • Pago seguro"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* FIN COUNTERS */}
            </div>
          </div>
        </div>
      </section>

<section className="w-full min-h-screen flex items-center justify-center py-6 sm:px-6 lg:px-8">
  <div className="w-full max-w-7xl flex flex-col items-center text-center">

    <div className="mb-8">
      <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900">Premios Increíbles</h3>
      <p className="mt-2 text-gray-500 text-lg">Tres oportunidades de ganar con tu mismo boleto</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0 mx-auto">
      <PrizeCard
        variant="first"
        rank="1er"
        title="Moto SBR 2025"
        description="Azul Eléctrico, 0KM + papeles al día"
        image="/moto.png"
        bg="bg-indigo-800"
      />

      <PrizeCard
        variant="second"
        rank="2do"
        title="Smart TV 43'"
        image="/tv.png"
      />

      <PrizeCard
        variant="third"
        rank="3er"
        title="$100 Dólares"
        image="/dolar.png"
      />
    </div>

  </div>
</section>


    </div>
  );
};

export default HomePage;
