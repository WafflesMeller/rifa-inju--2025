<<<<<<< HEAD
import { useState, useEffect } from 'react'
import './App.css' // Puedes mantener esto o borrarlo si prefieres estilos limpios

function App() {
  // Estados para manejar el formulario
  const [titulo, setTitulo] = useState('PagomóvilBDV recibido')
  const [texto, setTexto] = useState('Recibiste pago móvil de JUAN PEREZ por Bs. 1.250,00 el 04/12 Ref: 12345678')
  
  // Estado para la respuesta inmediata del servidor
  const [resultado, setResultado] = useState(null)
  
  // Estado para la lista completa de notificaciones
  const [historial, setHistorial] = useState([])
=======
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
>>>>>>> 747ab5ced5efed75c454e0ada70cdd08519621f2

  // 1. Función para enviar los datos al Backend (Node.js)
  const procesarNotificacion = async (e) => {
    e.preventDefault();
    try {
      // Preparamos los parámetros para la URL 
      const params = new URLSearchParams({
        TituloNotificacion: titulo,
        TextoNotificacion: texto
      });

      // Hacemos la petición al servidor local en el puerto 3000
      const response = await fetch(`http://localhost:3000/api/procesar?${params}`);
      const data = await response.json();
      
      // --- AQUÍ ESTÁ LA LÓGICA DEL MENSAJE ---
      // Mostramos la alerta que viene del servidor (Éxito o Error)
      alert(data.mensaje);

      setResultado(data);
      obtenerHistorial(); // Actualizamos la tabla de abajo
    } catch (error) {
      console.error("Error conectando con server:", error);
      alert("❌ Error: No se pudo conectar con el servidor (¿Está encendido?)");
    }
  }

  // 2. Función para cargar el historial guardado
  const obtenerHistorial = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/historial');
      const data = await res.json();
      setHistorial(data);
    } catch (error) { console.error(error) }
  }

  // Cargar historial apenas se abre la página
  useEffect(() => { obtenerHistorial() }, [])

  // 3. La Interfaz Visual (HTML/JSX)
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
