// src/components/Navbar.jsx
import React from "react";
import { Menu, X, Ticket, ShoppingCart, Sparkles } from "lucide-react";

const Navbar = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  selectedTickets,
  totalAmount,
}) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div
              className="shrink-0 flex items-center cursor-pointer"
              onClick={() => setActiveTab("inicio")}
            >
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-2">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">
                Gran Rifa SBR
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => setActiveTab("inicio")}
                className={`${
                  activeTab === "inicio"
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
              >
                Inicio
              </button>
              <button
                onClick={() => setActiveTab("comprar")}
                className={`${
                  activeTab === "comprar"
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
              >
                Comprar Tickets
              </button>
              <button
                onClick={() => setActiveTab("oracle")}
                className={`${
                  activeTab === "oracle"
                    ? "border-purple-500 text-purple-900"
                    : "border-transparent text-gray-500 hover:text-purple-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full group`}
              >
                <Sparkles className="w-4 h-4 mr-1 text-purple-500 group-hover:animate-pulse" />
                IA Mística
              </button>
            </div>
          </div>

          {/* Carrito Resumen (Escritorio) */}
          <div className="hidden sm:flex items-center">
            {selectedTickets.length > 0 && (
              <div
                className="bg-indigo-50 px-4 py-1 rounded-full flex items-center text-indigo-700 text-sm font-medium mr-4 border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors"
                onClick={() => setActiveTab("comprar")}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {selectedTickets.length} boletos (${totalAmount})
              </div>
            )}
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              JD
            </div>
          </div>

          {/* Botón Menú Móvil */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                setActiveTab("inicio");
                setIsMobileMenuOpen(false);
              }}
              className={`${
                activeTab === "inicio"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "text-gray-500"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
            >
              Inicio
            </button>
            <button
              onClick={() => {
                setActiveTab("comprar");
                setIsMobileMenuOpen(false);
              }}
              className={`${
                activeTab === "comprar"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "text-gray-500"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
            >
              Comprar Tickets
            </button>
            <button
              onClick={() => {
                setActiveTab("oracle");
                setIsMobileMenuOpen(false);
              }}
              className={`${
                activeTab === "oracle"
                  ? "bg-purple-50 border-purple-500 text-purple-700"
                  : "text-gray-500"
              } pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left flex items-center`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              IA Mística
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
