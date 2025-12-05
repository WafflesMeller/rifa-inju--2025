// src/components/Navbar.jsx
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Ticket, ShoppingCart, Sparkles } from "lucide-react";

/**
 * Navbar mejorado:
 * - mobile menu no ocupa espacio cuando está cerrado (max-height + overflow-hidden)
 * - animated indicator en desktop que se mueve entre los botones
 *
 * Props:
 *  - activeTab, setActiveTab
 *  - isMobileMenuOpen, setIsMobileMenuOpen
 *  - selectedTickets, totalAmount
 */
const Navbar = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  selectedTickets = [],
  totalAmount = 0,
}) => {
  const toggleMobile = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Refs para el indicator (desktop)
  const navContainerRef = useRef(null);
  const linkRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // mapping tabs to keys (ensure consistent order)
  const desktopTabs = [
    { key: "inicio", label: "Inicio" },
    { key: "comprar", label: "Comprar Tickets" },
    { key: "oracle", label: "IA Mística" },
  ];

  // calcula la posición del indicador basado en activeTab
  const updateIndicator = () => {
    const activeKey = activeTab || "inicio";
    const container = navContainerRef.current;
    const btn = linkRefs.current[activeKey];
    if (container && btn) {
      const contRect = container.getBoundingClientRect();
      const rect = btn.getBoundingClientRect();
      const left = rect.left - contRect.left;
      const width = rect.width;
      setIndicatorStyle({ left, width, opacity: 1 });
    } else {
      // si no hay btn (por ej en mobile) ocultamos indicador
      setIndicatorStyle((s) => ({ ...s, opacity: 0 }));
    }
  };

  // actualizar al montar, cuando cambie activeTab o al redimensionar
  useLayoutEffect(() => {
    updateIndicator();
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // helper para asignar ref desde NavLink
  const setLinkRef = (key, node) => {
    if (node) linkRefs.current[key] = node;
    else delete linkRefs.current[key];
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-white/50 backdrop-blur-xl"
      aria-label="Top navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: brand + desktop links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("inicio")}
              className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
              aria-label="Ir al inicio"
            >
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">Gran Rifa SBR</span>
            </button>

            {/* Desktop nav links (wrap with relative for indicator) */}
            <div className="hidden sm:block">
              <div ref={navContainerRef} className="relative">
                <div className="flex items-center space-x-2">
                  {desktopTabs.map((t) =>
                    t.key !== "oracle" ? (
                      <DesktopLink
                        key={t.key}
                        label={t.label}
                        active={activeTab === t.key}
                        onClick={() => setActiveTab(t.key)}
                        setRef={(node) => setLinkRef(t.key, node)}
                      />
                    ) : (
                      // oracle custom styled
                      <button
                        key={t.key}
                        ref={(n) => setLinkRef(t.key, n)}
                        onClick={() => setActiveTab(t.key)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition ${
                          activeTab === t.key
                            ? "text-purple-700"
                            : "text-gray-600 hover:text-purple-600"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="hidden md:inline">IA Mística</span>
                      </button>
                    )
                  )}
                </div>

                {/* Indicator bar (absolute) */}
                <span
                  aria-hidden
                  className="absolute bottom-0 h-0.5 bg-indigo-500 rounded transition-all duration-300"
                  style={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                    opacity: indicatorStyle.opacity,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: cart (desktop) + mobile toggle */}
          <div className="flex items-center gap-4">
            {/* Cart desktop summary */}
            <div className="hidden sm:flex items-center">
              {selectedTickets.length > 0 ? (
                <button
                  onClick={() => setActiveTab("comprar")}
                  className="inline-flex items-center gap-2 bg-white/70 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium border border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{selectedTickets.length} • ${totalAmount}</span>
                </button>
              ) : null}
            </div>

            {/* Mobile menu button (animated hamburger -> X). color adapt if background is light */}
            <div className="sm:hidden">
              <button
                onClick={toggleMobile}
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                className="relative w-10 h-10 flex items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                <span className="sr-only">{isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}</span>

                {/* Lines */}
                <span
                  className={`block absolute w-6 h-0.5 bg-gray-800 transition-transform duration-300 ${isMobileMenuOpen ? "rotate-45" : "-translate-y-2"}`}
                  style={{ transformOrigin: "center" }}
                />
                <span
                  className={`block absolute w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? "opacity-0 scale-90" : "opacity-100"}`}
                />
                <span
                  className={`block absolute w-6 h-0.5 bg-gray-800 transition-transform duration-300 ${isMobileMenuOpen ? "-rotate-45" : "translate-y-2"}`}
                  style={{ transformOrigin: "center" }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu (animated, but not occupying space when closed) */}
      <div
        className={`sm:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
          isMobileMenuOpen ? "max-h-[600px] opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="backdrop-blur-md bg-white/40 border-t border-white/10">
          <div className="pt-3 pb-4 space-y-1">
            <MobileLink
              label="Inicio"
              active={activeTab === "inicio"}
              onClick={() => {
                setActiveTab("inicio");
                setIsMobileMenuOpen(false);
              }}
            />
            <MobileLink
              label="Comprar Tickets"
              active={activeTab === "comprar"}
              onClick={() => {
                setActiveTab("comprar");
                setIsMobileMenuOpen(false);
              }}
            />
            <MobileLink
              label="IA Mística"
              active={activeTab === "oracle"}
              icon={<Sparkles className="w-4 h-4 text-purple-500" />}
              onClick={() => {
                setActiveTab("oracle");
                setIsMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

/* Desktop link component with ref forwarding via setRef prop */
const DesktopLink = ({ label, active, onClick, setRef }) => {
  return (
    <button
      ref={setRef}
      onClick={onClick}
      className={`px-3 py-1 text-sm font-medium rounded-md transition ${
        active ? "text-gray-900" : "text-gray-600 hover:text-gray-800"
      }`}
    >
      {label}
    </button>
  );
};

const MobileLink = ({ label, onClick, active, icon = null }) => (
  <button
    onClick={onClick}
    className={`w-full text-left pl-4 pr-4 py-3 flex items-center gap-3 transition ${
      active ? "bg-white/30 text-gray-900" : "text-gray-700 hover:bg-white/10"
    }`}
  >
    {icon}
    <span className="text-base font-medium">{label}</span>
  </button>
);

export default Navbar;
