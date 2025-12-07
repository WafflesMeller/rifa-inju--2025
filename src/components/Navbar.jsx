// src/components/Navbar.jsx
import React, { useRef, useState, useLayoutEffect } from "react";
import { Ticket, Sparkles, Search } from "lucide-react"; // Importé Search para el icono (opcional)

/**
 * Navbar sin carrito + active en bold + hover color como IA
 *
 * Props:
 * - activeTab, setActiveTab
 * - isMobileMenuOpen, setIsMobileMenuOpen
 * */
const Navbar = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const toggleMobile = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Refs para el indicador (desktop)
  const navContainerRef = useRef(null);
  const linkRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // 👇 1. AGREGAMOS "MIS TICKETS" AL ARRAY
  const desktopTabs = [
    { key: "inicio", label: "Inicio" },
    { key: "comprar", label: "Comprar Tickets" },
    { key: "mis-tickets", label: "Mis Tickets" }, // <--- NUEVO
    { key: "oracle", label: "IA Mística" },
  ];

  const updateIndicator = () => {
    const activeKey = activeTab || "inicio";
    const container = navContainerRef.current;
    const btn = linkRefs.current[activeKey];
    if (container && btn) {
      const contRect = container.getBoundingClientRect();
      const rect = btn.getBoundingClientRect();
      setIndicatorStyle({
        left: rect.left - contRect.left,
        width: rect.width,
        opacity: 1,
      });
    } else {
      setIndicatorStyle((s) => ({ ...s, opacity: 0 }));
    }
  };

  useLayoutEffect(() => {
    updateIndicator();
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const setLinkRef = (key, node) => {
    if (node) linkRefs.current[key] = node;
    else delete linkRefs.current[key];
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-white shadow-sm"
      aria-label="Top navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand + Desktop Nav */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("inicio")}
              className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
            >
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">
                Gran Rifa SBR
              </span>
            </button>

            {/* Desktop links */}
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
                      <button
                        key={t.key}
                        ref={(n) => setLinkRef(t.key, n)}
                        onClick={() => setActiveTab(t.key)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm transition ${
                          activeTab === t.key
                            ? "text-purple-700 font-bold"
                            : "text-gray-600 hover:text-purple-600"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="hidden md:inline">IA Mística</span>
                      </button>
                    )
                  )}
                </div>

                {/* Barra indicadora */}
                <span
                  className="absolute bottom-0 h-0.5 bg-indigo-500 transition-all duration-300 rounded-full"
                  style={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                    opacity: indicatorStyle.opacity,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-4 sm:hidden">
            <button
              onClick={toggleMobile}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="relative w-10 h-10 flex items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              {/* Line 1 */}
              <span
                className={`block absolute w-6 h-0.5 bg-gray-800 transition-transform duration-300 ${
                  isMobileMenuOpen ? "rotate-45" : "-translate-y-2"
                }`}
                style={{ transformOrigin: "center" }}
              />
              {/* Line 2 */}
              <span
                className={`block absolute w-6 h-0.5 bg-gray-800 transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0 scale-90" : "opacity-100"
                }`}
              />
              {/* Line 3 */}
              <span
                className={`block absolute w-6 h-0.5 bg-gray-800 transition-transform duration-300 ${
                  isMobileMenuOpen ? "-rotate-45" : "translate-y-2"
                }`}
                style={{ transformOrigin: "center" }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`sm:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
          isMobileMenuOpen
            ? "max-h-[600px] opacity-100 pointer-events-auto"
            : "max-h-0 opacity-0 pointer-events-none"
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

            {/* 👇 2. AGREGAMOS EL LINK MÓVIL AQUÍ */}
            <MobileLink
              label="Mis Tickets"
              active={activeTab === "mis-tickets"}
              onClick={() => {
                setActiveTab("mis-tickets");
                setIsMobileMenuOpen(false);
              }}
            />

            <MobileLink
              label="IA Mística"
              icon={<Sparkles className="w-4 h-4 text-purple-500" />}
              active={activeTab === "oracle"}
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

/* Desktop link con active en bold + hover indigo */
const DesktopLink = ({ label, active, onClick, setRef }) => {
  return (
    <button
      ref={setRef}
      onClick={onClick}
      className={`px-3 py-1 text-sm transition rounded-md ${
        active
          ? "text-gray-900 font-bold"
          : "text-gray-600 hover:text-indigo-600"
      }`}
    >
      {label}
    </button>
  );
};

/* Mobile links - active en bold */
const MobileLink = ({ label, onClick, active, icon = null }) => (
  <button
    onClick={onClick}
    className={`w-full text-left pl-4 pr-4 py-3 flex items-center gap-3 transition ${
      active ? "bg-white/30 text-gray-900 font-bold" : "text-gray-700 hover:bg-white/10"
    }`}
  >
    {icon}
    <span className="text-base">{label}</span>
  </button>
);

export default Navbar;