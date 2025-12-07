// src/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import { createClient } from '@supabase/supabase-js';
import Navbar from "./components/Navbar";
import FloatingCheckoutBar from "./components/FloatingCheckoutBar";
import BuyTicketsPage from "./page/BuyTicketsPage";
import OraclePage from "./page/OraclePage";
import HomePage from "./page/HomePage";
import CheckoutPage from "./page/CheckoutPage";
import MyTicketsPage from "./page/MyTicketsPage";

// Inicializamos Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [selectedTickets, setSelectedTickets] = useState([]);

  const TICKET_PRICE = "3";

  // Estado para guardar los tickets vendidos
  const [soldTicketsSet, setSoldTicketsSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  // Estado para mostrar carga cuando verifica disponibilidad
  const [verificando, setVerificando] = useState(false); 

  // --- 1. CARGAR VENDIDOS AL INICIO ---
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('tickets_vendidos')
          .select('numero');

        if (error) {
          console.error("❌ Error cargando tickets:", error);
        } else {
          // Normalizamos a string de 3 dígitos
          const numerosOcupados = new Set(
            data.map(fila => fila.numero.toString().padStart(3, '0'))
          );
          setSoldTicketsSet(numerosOcupados);
        }
      } catch (err) {
        console.error("❌ Error de conexión:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // --- 2. GENERAR TABLERO ---
  const tickets = useMemo(() => {
    return Array.from({ length: 1000 }, (_, i) => {
      const idFormateado = i.toString().padStart(3, '0');
      return {
        id: idFormateado,
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
    const numString = number.toString().padStart(3, '0');
    setSelectedTickets((prev) =>
      prev.includes(numString) ? prev : [...prev, numString]
    );
  };

  // --- 3. NUEVA FUNCIÓN: VERIFICAR ANTES DE PAGAR ---
  const handleProceedToCheckout = async () => {
    if (selectedTickets.length === 0) return;
    
    setVerificando(true); // Podrías usar esto para poner un spinner en el botón flotante

    try {
      // Preguntamos a Supabase: "¿Alguno de estos tickets YA existe en la tabla vendidos?"
      const { data, error } = await supabase
        .from('tickets_vendidos')
        .select('numero')
        .in('numero', selectedTickets); // Check masivo eficiente

      if (error) throw error;

      if (data && data.length > 0) {
        // 🚨 CASO: ALGUIEN NOS GANÓ DE MANO
        const vendidosEncontrados = data.map(d => d.numero.toString().padStart(3, '0'));
        
        // 1. Actualizamos el tablero visualmente (los ponemos naranja)
        setSoldTicketsSet(prev => {
           const nuevoSet = new Set(prev);
           vendidosEncontrados.forEach(n => nuevoSet.add(n));
           return nuevoSet;
        });

        // 2. Los sacamos del carrito del usuario
        setSelectedTickets(prev => prev.filter(t => !vendidosEncontrados.includes(t)));

        // 3. Avisamos al usuario
        alert(`⚠️ Lo sentimos. Los siguientes números acaban de ser vendidos a otra persona: ${vendidosEncontrados.join(", ")}. Han sido removidos de tu selección.`);
      
      } else {
        // ✅ CASO: TODO LIMPIO, PASE A PAGAR
        setActiveTab("checkout");
      }

    } catch (err) {
      console.error("Error verificando tickets:", err);
      alert("Error de conexión al verificar los tickets. Intenta de nuevo.");
    } finally {
      setVerificando(false);
    }
  };


  const totalAmount = selectedTickets.length * parseFloat(TICKET_PRICE);

  return (
    <div className="text-gray-900 font-poppins">
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
                Cargando tickets...
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
              window.location.reload(); 
            }}
          />
        )}

        {activeTab === "mis-tickets" && (
          <MyTicketsPage 
             onBack={() => setActiveTab("inicio")} 
          />
        )}

      {/* AQUÍ CONECTAMOS LA VERIFICACIÓN:
        En lugar de ir directo a 'checkout', llamamos a handleProceedToCheckout 
      */}
      <FloatingCheckoutBar
        selectedTickets={selectedTickets}
        totalAmount={totalAmount}
        onClear={() => setSelectedTickets([])}
        onGoToComprar={handleProceedToCheckout} // <--- CAMBIO CLAVE AQUÍ
      />
      
      {/* Opcional: Overlay de carga mientras verifica */}
      {verificando && (
        <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-xl flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
                <span className="font-semibold text-gray-700">Verificando disponibilidad...</span>
            </div>
        </div>
      )}

    </div>
  );
}