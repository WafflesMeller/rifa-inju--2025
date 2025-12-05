// src/App.jsx
import React, { useState, useMemo } from "react";
import Navbar from "./components/Navbar";
import FloatingCheckoutBar from "./components/FloatingCheckoutBar";
import BuyTicketsPage from "./page/BuyTicketsPage";
import OraclePage from "./page/OraclePage";
import HomePage from "./page/HomePage";

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [selectedTickets, setSelectedTickets] = useState([]);

  const TICKET_PRICE = 3;

  // Datos simulados de tickets vendidos
  const soldTicketsSet = useMemo(
    () => new Set([15, 42, 100, 555, 777, 999, 123, 456, 888]),
    []
  );

  const tickets = useMemo(() => {
    return Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      status: soldTicketsSet.has(i) ? "sold" : "available",
    }));
  }, [soldTicketsSet]);

  const handleTicketToggle = (number) => {
    setSelectedTickets((prev) => {
      if (prev.includes(number)) {
        return prev.filter((n) => n !== number);
      } else {
        return [...prev, number];
      }
    });
  };

  const handleAddFromOracle = (number) => {
    setSelectedTickets((prev) =>
      prev.includes(number) ? prev : [...prev, number]
    );
  };

  const totalAmount = selectedTickets.length * TICKET_PRICE;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        selectedTickets={selectedTickets}
        totalAmount={totalAmount}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === "inicio" && (
          <HomePage TICKET_PRICE={TICKET_PRICE} setActiveTab={setActiveTab} />
        )}

        {activeTab === "oracle" && (
          <OraclePage
            onAddNumbers={handleAddFromOracle}
            soldTickets={soldTicketsSet}
          />
        )}

        {activeTab === "comprar" && (
          <BuyTicketsPage
            tickets={tickets}
            selectedTickets={selectedTickets}
            onToggle={handleTicketToggle}
          />
        )}
      </main>

      <FloatingCheckoutBar
        selectedTickets={selectedTickets}
        totalAmount={totalAmount}
        onClear={() => setSelectedTickets([])}
        onGoToComprar={() => setActiveTab("comprar")}
      />
    </div>
  );
}
