// src/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import { createClient } from '@supabase/supabase-js';
import Navbar from "./components/Navbar";
import FloatingCheckoutBar from "./components/FloatingCheckoutBar";
import BuyTicketsPage from "./page/BuyTicketsPage";
import OraclePage from "./page/OraclePage";
import HomePage from "./page/HomePage";
import CheckoutPage from "./page/CheckoutPage";

// Inicializamos Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [selectedTickets, setSelectedTickets] = useState([]);

  const TICKET_PRICE =  "3";

  // 1. Estado para guardar los tickets vendidos
  const [soldTicketsSet, setSoldTicketsSet] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // --- EFECTO: CARGAR VENDIDOS DE SUPABASE ---
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('tickets_vendidos')
          .select('numero');

        if (error) {
          console.error("❌ Error cargando tickets:", error);
        } else {
          // CORRECCIÓN 1: Aseguramos que lo que viene de la BD sea string de 3 dígitos
          // Ejemplo: Si viene 5, lo convierte en "005". Si viene "5", también.
          const numerosOcupados = new Set(
            data.map(fila => fila.numero.toString().padStart(3, '0'))
          );
          
          setSoldTicketsSet(numerosOcupados);
          console.log("✅ Tickets ocupados cargados:", numerosOcupados.size);
        }
      } catch (err) {
        console.error("❌ Error de conexión:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // --- MEMO: GENERAR LOS 1000 TICKETS (000 - 999) ---
  const tickets = useMemo(() => {
    return Array.from({ length: 1000 }, (_, i) => {
      
      // CORRECCIÓN 2: Generamos IDs como "000", "001"... "999"
      const idFormateado = i.toString().padStart(3, '0');
      
      return {
        id: idFormateado, // Ahora el ID es texto: "005"
        status: soldTicketsSet.has(idFormateado) ? "sold" : "available",
      };
    });
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
    // El Oráculo también debe devolver strings (ej: "042"), 
    // pero por seguridad lo convertimos aquí si es necesario.
    const numString = number.toString().padStart(3, '0');
    
    setSelectedTickets((prev) =>
      prev.includes(numString) ? prev : [...prev, numString]
    );
  };

  const totalAmount = selectedTickets.length * parseFloat(TICKET_PRICE);

  return (
    <div className="text-gray-900 pb-24 font-poppins">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        selectedTickets={selectedTickets}
        totalAmount={totalAmount}
      />

        {activeTab === "inicio" && (
          <HomePage 
            TICKET_PRICE={TICKET_PRICE} 
            setActiveTab={setActiveTab} 
            totalSold={soldTicketsSet.size} 
            totalTickets={1000} 
          />
        )}

        {activeTab === "oracle" && (
          <OraclePage
            onAddNumbers={handleAddFromOracle}
            soldTickets={soldTicketsSet}
          />
        )}

        {activeTab === "comprar" && (
          loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-2xl mb-4">⏳</div>
              <p className="text-gray-500 font-bold animate-pulse">
                Verificando disponibilidad...
              </p>
            </div>
          ) : (
            <BuyTicketsPage
              tickets={tickets}
              selectedTickets={selectedTickets}
              onToggle={handleTicketToggle}
            />
          )
        )}

        {activeTab === "checkout" && (
          <CheckoutPage 
            selectedTickets={selectedTickets}
            totalAmount={totalAmount}
            onBack={() => setActiveTab("comprar")}
            onSuccess={() => {
              setSelectedTickets([]); 
              setActiveTab("inicio");
              // Opcional: Podrías recargar la página o volver a hacer fetch 
              // para actualizar los vendidos en tiempo real
              window.location.reload(); 
            }}
          />
        )}

      <FloatingCheckoutBar
        selectedTickets={selectedTickets}
        totalAmount={totalAmount}
        onClear={() => setSelectedTickets([])}
        onGoToComprar={() => setActiveTab("checkout")}
      />
    </div>
  );
}