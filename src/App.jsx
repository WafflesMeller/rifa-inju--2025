// src/App.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Importación de Componentes
import Navbar from './components/Navbar';
import FloatingCheckoutBar from './components/FloatingCheckoutBar';
import BuyTicketsPage from './page/BuyTicketsPage';
import OraclePage from './page/OraclePage';
import HomePage from './page/HomePage';
import CheckoutPage from './page/CheckoutPage';
import MyTicketsPage from './page/MyTicketsPage';

// Inicialización de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  // --- ESTADOS GLOBALES ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [selectedTickets, setSelectedTickets] = useState([]);

  // Estado de Tickets
  const [soldTicketsSet, setSoldTicketsSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [verificando, setVerificando] = useState(false);

  const TICKET_PRICE = '3';

  // Función de carga inicial (se mantiene igual)
  const fetchSoldTickets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tickets_vendidos')
        .select('numero');

      if (error) {
        console.error('❌ Error cargando tickets:', error);
      } else {
        const numerosOcupados = new Set(
          data.map((fila) => fila.numero.toString().padStart(3, '0'))
        );
        setSoldTicketsSet(numerosOcupados);
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🟢 CAMBIO PRINCIPAL: LÓGICA REALTIME
  useEffect(() => {
    // 1. Cargar datos existentes al abrir la app
    fetchSoldTickets();

    // 2. Suscribirse a NUEVAS ventas en tiempo real
    const channel = supabase
      .channel('tickets_realtime') // Nombre del canal (puede ser cualquiera)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tickets_vendidos' },
        (payload) => {
          // Cuando entra una venta nueva, la agregamos al Set inmediatamente
          const nuevoNumero = payload.new.numero.toString().padStart(3, '0');
          
          setSoldTicketsSet((prevSet) => {
            const newSet = new Set(prevSet);
            newSet.add(nuevoNumero);
            return newSet;
          });
          
          console.log(`🔔 Nuevo ticket vendido recibido en tiempo real: ${nuevoNumero}`);
        }
      )
      .subscribe();

    // 3. Limpieza al salir del componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSoldTickets]);

  // --- LÓGICA DEL TABLERO ---
  const tickets = useMemo(() => {
    return Array.from({ length: 1000 }, (_, i) => {
      const idFormateado = i.toString().padStart(3, '0');
      return {
        id: idFormateado,
        status: soldTicketsSet.has(idFormateado) ? 'sold' : 'available',
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

  // --- LÓGICA DE VERIFICACIÓN PRE-PAGO ---
  const handleProceedToCheckout = async () => {
    if (selectedTickets.length === 0) return;
    setVerificando(true);

    try {
      const { data, error } = await supabase
        .from('tickets_vendidos')
        .select('numero')
        .in('numero', selectedTickets);

      if (error) throw error;

      if (data && data.length > 0) {
        const vendidosEncontrados = data.map((d) => 
          d.numero.toString().padStart(3, '0')
        );

        setSoldTicketsSet((prev) => {
          const nuevoSet = new Set(prev);
          vendidosEncontrados.forEach((n) => nuevoSet.add(n));
          return nuevoSet;
        });

        setSelectedTickets((prev) => 
          prev.filter((t) => !vendidosEncontrados.includes(t))
        );

        alert(
          `⚠️ Lo sentimos. Los números ${vendidosEncontrados.join(', ')} acaban de ser vendidos. Han sido removidos de tu selección.`
        );
      } else {
        setActiveTab('checkout');
      }
    } catch (err) {
      console.error('Error verificando tickets:', err);
      alert('Error de conexión al verificar los tickets. Intenta de nuevo.');
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

      {/* --- SECCIÓN: INICIO --- */}
      {activeTab === 'inicio' && (
        <HomePage
          TICKET_PRICE={TICKET_PRICE}
          setActiveTab={setActiveTab}
          totalSold={soldTicketsSet.size}
          totalTickets={1000}
        />
      )}

      {/* --- SECCIÓN: ORÁCULO --- */}
      {activeTab === 'oracle' && (
        <OraclePage
          soldTickets={soldTicketsSet}
          selectedTickets={selectedTickets}
          onAddNumbers={handleTicketToggle}
          onRemoveNumber={handleTicketToggle}
        />
      )}

      {/* --- SECCIÓN: COMPRAR TICKETS --- */}
      {activeTab === 'comprar' &&
        (loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-2xl mb-4">⏳</div>
            <p className="text-gray-500 font-bold animate-pulse">Cargando tickets...</p>
          </div>
        ) : (
          <BuyTicketsPage 
            tickets={tickets} 
            selectedTickets={selectedTickets} 
            onToggle={handleTicketToggle} 
          />
        ))}

      {/* --- SECCIÓN: CHECKOUT (PAGO) --- */}
      {activeTab === 'checkout' && (
        <CheckoutPage
          selectedTickets={selectedTickets}
          totalAmount={totalAmount}
          onBack={() => setActiveTab('comprar')}
          
          // 🟢 CAMBIO: onSuccess simplificado
          // Ya no hacemos fetchSoldTickets() manual porque el Realtime lo hará solo
          onSuccess={() => {
            setSelectedTickets([]);
            setActiveTab('inicio');
            alert("¡Compra procesada con éxito! Tus tickets han sido registrados.");
          }}
        />
      )}

      {/* --- SECCIÓN: MIS TICKETS --- */}
      {activeTab === 'mis-tickets' && (
        <MyTicketsPage onBack={() => setActiveTab('inicio')} />
      )}

      {/* --- BARRA FLOTANTE DE PAGO --- */}
      <FloatingCheckoutBar
        selectedTickets={selectedTickets}
        totalAmount={totalAmount}
        onClear={() => setSelectedTickets([])}
        onGoToComprar={handleProceedToCheckout}
      />

      {/* --- OVERLAY DE CARGA (VERIFICACIÓN) --- */}
      {verificando && (
        <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-gray-700">Verificando disponibilidad...</span>
          </div>
        </div>
      )}
    </div>
  );
}