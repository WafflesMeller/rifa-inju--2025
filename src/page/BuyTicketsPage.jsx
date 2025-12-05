// src/page/BuyTicketsPage.jsx
import React from "react";
import TicketNumber from "../components/TicketNumber";

const BuyTicketsPage = ({ tickets, selectedTickets, onToggle }) => {
  return (
    <div className="px-4 sm:px-0">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Selecciona tus Números
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Elige tus números de la suerte. (Gris = Vendido, Azul = Tu
              selección)
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-white border border-gray-300 rounded mr-2"></span>
              Disponible
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-indigo-600 rounded mr-2"></span>
              Seleccionado
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-gray-200 rounded mr-2"></span>
              Vendido
            </div>
          </div>
        </div>

        {/* Grid de Tickets */}
        <div className="p-4 sm:p-6 bg-gray-50 max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {tickets.map((ticket) => (
              <TicketNumber
                key={ticket.id}
                number={ticket.id}
                status={
                  selectedTickets.includes(ticket.id)
                    ? "selected"
                    : ticket.status
                }
                onSelect={onToggle}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyTicketsPage;
