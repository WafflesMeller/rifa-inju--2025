// src/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import { createClient } from '@supabase/supabase-js';
import Navbar from "./components/Navbar";
import FloatingCheckoutBar from "./components/FloatingCheckoutBar";
import BuyTicketsPage from "./page/BuyTicketsPage";
import OraclePage from "./page/OraclePage";
import HomePage from "./page/HomePage";

// Inicializamos Supabase con las claves de tu archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [selectedTickets, setSelectedTickets] = useState([]);

  const TICKET_PRICE = 3;

  // --- CAMBIO FASE 2 ---
  // 1. Estado para guardar los tickets que vengan de Supabase (empieza vacío)
  const [soldTicketsSet, setSoldTicketsSet] = useState(new Set());
  
  // 2. Estado para saber si seguimos cargando (opcional, para UI)
  const [loading, setLoading] = useState(true);

  // 3. Efecto: Se ejecuta una sola vez al cargar la página
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Consultamos la tabla 'tickets_vendidos'
        const { data, error } = await supabase
          .from('tickets_vendidos')
          .select('numero');

        if (error) {
          console.error("❌ Error cargando tickets:", error);
        } else {
          // Convertimos la respuesta en un Set (lista sin duplicados)
          const numerosOcupados = new Set(data.map(fila => fila.numero));
          setSoldTicketsSet(numerosOcupados);
          console.log("✅ Tickets cargados:", numerosOcupados.size);
        }
      } catch (err) {
        console.error("❌ Error de conexión:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);
  // --- FIN CAMBIO FASE 2 ---

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
    <div className="min-h-screen text-gray-900 pb-24 font-poppins">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        selectedTickets={selectedTickets}
        totalAmount={totalAmount}
      />

      <main className="">
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
