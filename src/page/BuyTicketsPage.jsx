// src/page/BuyTicketsPage.jsx
import React, { useMemo } from 'react';
import TicketNumber from '../components/TicketNumber';

const BuyTicketsPage = ({ tickets = [], selectedTickets = [], onToggle = () => {} }) => {
  const soldCount = useMemo(
    () => tickets.filter((t) => t.status === 'sold' || t.status === 'vendido').length,
    [tickets]
  );
  const availableCount = Math.max(0, tickets.length - soldCount);

  return (
    // 1️⃣ — ESTA ES LA CORRECCIÓN PRINCIPAL
    // Asegura que toda la PANTALLA esté ocupada, sin bordes
    <div className="w-full min-h-screen flex flex-col">
      <div
        className="w-full flex-1 overflow-hidden px-6 py-10 flex"
        style={{ background: 'linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)' }}
      >
        {/* 2️⃣ El contenedor interno AHORA sí llena la pantalla */}
        <div className="mx-auto w-full max-w-7xl pb-18 flex flex-col flex-1">
          {/* HEADER */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Selecciona tus números
                </h1>
                <p className="mt-2 text-sm text-indigo-100">
                  Elige tus números de la suerte.
                </p>
              </div>
            </div>
          </div>

          {/* PANEL PRINCIPAL */}
          <div className="rounded-2xl overflow-hidden bg-white/6 backdrop-blur-md border border-white/10 flex flex-col flex-1">
            {/* LEGEND STICKY */}
            <div className="sticky top-0 z-10 bg-white/5 backdrop-blur-md px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <LegendDot color="bg-white" label="Disponible" />
                <LegendDot color="bg-indigo-600" label="Seleccionado" />
                <LegendDot color="bg-gray-300" label="Vendido" />
              </div>

              <div className="text-sm text-indigo-100">
                <span className="font-semibold text-white">{availableCount}</span> disponibles •{' '}
                <span className="font-semibold text-white">{soldCount}</span> vendidos
              </div>
            </div>

            {/* 3️⃣ — AQUÍ ESTÁ LA CLAVE: este es el bloque que debe crecer */}
            <div className="p-4 sm:p-6 flex-1 overflow-auto">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                {tickets.map((ticket) => {
                  const status = selectedTickets.includes(ticket.id) ? 'selected' : ticket.status;
                  return (
                    <TicketNumber
                      key={ticket.id}
                      number={ticket.id}
                      status={status}
                      onSelect={() => onToggle(ticket.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-2 text-indigo-100">
    <span className={`w-3 h-3 rounded-full ${color} ring-1 ring-white/20`} />
    <span className="text-sm">{label}</span>
  </div>
);

export default BuyTicketsPage;
