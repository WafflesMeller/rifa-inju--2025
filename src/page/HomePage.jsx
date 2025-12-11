// src/page/HomePage.jsx
import React from 'react';
// imports en el archivo del Hero (arriba)
import { Sparkles, TrophyIcon } from 'lucide-react';
import { Ticket, CalendarDays, CircleDollarSign } from 'lucide-react';

import PrizeCard from '../components/PrizeCard';
import StatCounter from '../components/StatCounter';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const TimeBox = ({ value, label }) => (
  <div className="relative group flex flex-col items-center justify-center 
    /* AJUSTES MÓVIL: ancho mínimo 60px, padding pequeño (p-2) */
    bg-gradient-to-b from-slate-800/40 to-slate-900/40 
    border-t border-l border-white/20 border-b border-r border-white/5 
    rounded-xl p-2 sm:p-5 min-w-[60px] sm:min-w-[100px] 
    backdrop-blur-xl shadow-2xl shadow-indigo-500/10 
    transform transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/20"
  >
    {/* Decoración brillo */}
    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-md opacity-50" />

    {/* AJUSTES MÓVIL: Texto más pequeño (text-xl o 2xl) */}
    <span className="text-2xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-50 to-indigo-200 tabular-nums font-mono tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
      {String(value).padStart(2, '0')}
    </span>
    
    <span className="text-[9px] sm:text-xs font-bold text-indigo-300 uppercase tracking-widest mt-1 sm:mt-2">
      {label}
    </span>
  </div>
);

const Separator = () => (
  /* AJUSTES MÓVIL: Menos padding bottom (pb-4) y gap más pequeño */
  <div className="flex flex-col gap-1.5 sm:gap-3 h-full justify-center pb-4 sm:pb-8 opacity-80">
    <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse" />
    <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse delay-75" />
  </div>
);

const HomePage = ({ TICKET_PRICE, setActiveTab, totalSold, totalTickets }) => {
  const sold = totalSold || 0;
  const total = totalTickets || 1000;
  const percentage = Math.round((sold / total) * 100);

  // LÓGICA DE LA CUENTA REGRESIVA
  const calculateTimeLeft = () => {
    const year = new Date().getFullYear();
    // Mes es 11 porque en JS Enero es 0. (30 Diciembre, 19:00:00)
    const targetDate = new Date(year, 11, 30, 19, 0, 0);
    const now = new Date();
    const difference = targetDate - now;

    if (difference > 0) {
      return {
        dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    }
    return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
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
            <div className="relative z-10 w-full px-6 md:px-10 lg:px-16 py-12 md:py-6 h-full flex flex-col justify-between">
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
                      La moto más codiciada del año puede ser tuya. Diseño renovado, color azul eléctrico y 0KM. <br />
                      Quedan <span className="font-semibold text-white">pocos</span> números.
                    </p>

                    {/* --- BLOQUE DE CUENTA REGRESIVA MEJORADO --- */}
                    <div className="w-full my-5 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      {/* Encabezado del timer */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-px flex-1 bg-linear-to-r from-transparent via-indigo-400/50 to-transparent"></div>
                        <span className="text-sm font-bold text-yellow-400 uppercase tracking-widest drop-shadow-sm">
                          ⏳ Tiempo Restante
                        </span>
                        <div className="h-px flex-1 bg-linear-to-r from-transparent via-indigo-400/50 to-transparent"></div>
                      </div>

                      {/* Contenedor del Timer */}
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4">
                        <TimeBox value={timeLeft.dias} label="Días" />
                        <Separator />
                        <TimeBox value={timeLeft.horas} label="Hrs" />
                        <Separator />
                        <TimeBox value={timeLeft.minutos} label="Min" />
                        <Separator />
                        <TimeBox value={timeLeft.segundos} label="Seg" />
                      </div>

                      {/* Mensaje de urgencia debajo (opcional) */}
                      <p className="mt-4 text-xs sm:text-sm text-indigo-200/80 text-center lg:text-left font-medium">
                        El sorteo cierra automáticamente al llegar a cero.
                      </p>
                    </div>
                    {/* --- FIN BLOQUE --- */}

                    {/* ---------------------------
                  Imagen móvil/mediana:
                  visible solo en sm/md (encima de botones)
                 --------------------------- */}
                    <div className="lg:hidden w-full flex items-center justify-center mt-6 mb-2">
                      <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-linear-to-br from-indigo-900/15 to-blue-900/05 opacity-60 pointer-events-none" />
                        <img
                          src="/moto.webp"
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
                        Comprar Números
                      </button>

                      <button
                        onClick={() => setActiveTab('oracle')}
                        className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-indigo-300/30 bg-indigo-900/40 text-base font-medium text-purple-100 backdrop-blur-sm transform transition duration-200 hover:scale-105"
                      >
                        <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                        Consultar al Oráculo
                      </button>
                    </div>
                  </div>
                </div>

                {/* DERECHA: imagen (solo visible en lg+) */}
                <div className="flex-1 w-full flex items-center justify-center lg:justify-end">
                  <div className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 items-center justify-center hidden lg:flex">
                    <div className="absolute inset-0 rounded-full bg-linear-to-br from-indigo-900/20 to-blue-900/10 opacity-60 pointer-events-none" />

                    <img
                      src="/moto.webp"
                      alt="Moto Bera SBR Azul"
                      className="relative w-full h-full object-contain drop-shadow-2xl transform transition-transform duration-300 hover:scale-105"
                      style={{ maxWidth: 420, maxHeight: 420 }}
                    />
                  </div>
                </div>
              </div>

              {/* COUNTERS: parte inferior (igual que antes) */}
              <div className="w-full mt-5">
                <div className="mx-auto max-w-7xl px-0">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 lg:grid-cols-2">
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
                      onClick={() => setActiveTab('comprar')}
                    />

                    <StatCounter
                      title="La mejor loteria"
                      value="Triple Chance"
                      icon={TrophyIcon}
                      color="bg-yellow-500"
                      hint="Compra 1 número y gana 3 premios"
                      onClick={() => setActiveTab('comprar')}
                    />

                    <StatCounter
                      title="07:00 p.m."
                      value="30 Diciembre"
                      icon={CalendarDays}
                      color="bg-red-500"
                      hint="¡No te lo pierdas juega y gana!"
                      onClick={() => setActiveTab('comprar')}
                    />

                    <StatCounter
                      title="Valor del Boleto"
                      value={`${TICKET_PRICE} REF`}
                      icon={CircleDollarSign}
                      color="bg-green-500"
                      hint="A tasa Euro BCV • Pago seguro"
                      onClick={() => setActiveTab('comprar')}
                    />
                  </div>
                </div>
              </div>
              {/* FIN COUNTERS */}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full flex justify-center mt-10 mb-10 py-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl flex flex-col items-center text-center">
          <div className="mb-8">
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900">Premios Increíbles</h3>
            <p className="mt-2 text-gray-500 text-lg">Tres oportunidades de ganar con el mismo número</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0 w-full">
            <PrizeCard
              variant="first"
              rank="1er"
              title="Moto SBR 2025"
              description="Azul Eléctrico, 150cc de potencia, 0KM + papeles al día"
              image="/moto.webp"
              bg="bg-indigo-800"
              onClick={() => setActiveTab('comprar')}
            />

            <PrizeCard
              variant="second"
              rank="2do"
              title="Smart TV 43'"
              description="Marca Da+co con Google TV"
              image="/tv.webp"
              onClick={() => setActiveTab('comprar')}
            />

            <PrizeCard
              variant="third"
              rank="3er"
              title="$100 Dólares"
              description="Entrega inmediata, vía efectivo o transferencia"
              image="/dinero.webp"
              ctaText="¡Participar Ahora!"
              onClick={() => setActiveTab('comprar')}
            />
          </div>
        </div>
      </section>

      <section
        className="w-full py-10"
        style={{ background: 'linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center text-white">
          <h4 className="text-2xl font-bold mb-3 tracking-tight">¿Tienes alguna duda?</h4>
          <p className="text-indigo-200 mb-8 max-w-lg">
            Estamos disponibles para responder tus preguntas y ayudarte con la compra de tu boleto. Síguenos para ver
            los resultados en vivo.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            {/* Botón Instagram */}
            <a
              href="https://www.instagram.com/flowlaguairaa"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-white/10 hover:bg-pink-600/90 px-6 py-3 rounded-full backdrop-blur-sm transition-all duration-300 border border-white/10 hover:border-pink-500 hover:scale-105 shadow-lg"
            >
              <FaInstagram className="w-6 h-6 text-white" />
              <span className="font-semibold">Instagram</span>
            </a>

            {/* Botón WhatsApp */}
            <a
              href="https://wa.me/584166473681"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-white/10 hover:bg-green-600/90 px-6 py-3 rounded-full backdrop-blur-sm transition-all duration-300 border border-white/10 hover:border-green-500 hover:scale-105 shadow-lg"
            >
              <FaWhatsapp className="w-6 h-6 text-white" />
              <span className="font-semibold">WhatsApp</span>
            </a>
          </div>

          <p className="mt-10 text-xs text-indigo-400/60 font-medium">
            © 2025 Gran Rifa. Juega y gana increibles premios.
          </p>
        </div>
      </section>
    </>
  );
};

export default HomePage;
