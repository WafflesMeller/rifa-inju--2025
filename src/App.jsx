import React, { useState, useMemo } from 'react';
import { Menu, X, Home, ShoppingCart, Ticket, Award, CheckCircle, Zap, DollarSign, Tv, Bike, Sparkles, BrainCircuit, Loader2, ArrowRight } from 'lucide-react';

// --- SERVICIO GEMINI API ---
const callGeminiOracle = async (userContext) => {
  const apiKey = ""; // Se inyecta en tiempo de ejecución
  const systemPrompt = `
    Eres "El Oráculo de la Fortuna", un numerólogo místico y experto en azar para una rifa de una moto.
    Tu objetivo es interpretar el texto del usuario (un sueño, una fecha, un sentimiento) y generar 3 "Números de la Suerte" (entre 000 y 999).
    
    Reglas:
    1. Analiza el texto del usuario buscando simbolismos.
    2. Genera exactamente 3 números enteros únicos entre 0 y 999.
    3. Escribe una predicción corta, mística y divertida explicando por qué elegiste esos números.
    4. Responde ÚNICAMENTE en formato JSON válido.
    
    Formato de respuesta JSON esperado:
    {
      "numbers": [123, 45, 999],
      "message": "Tu sueño de volar indica altura (999) y libertad..."
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Contexto del usuario: "${userContext}". Dame mis números de la suerte.` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    if (!response.ok) throw new Error('Error conectando con el Oráculo');
    
    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Error en Gemini:", error);
    return null;
  }
};

// --- COMPONENTES AUXILIARES ---

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd>
            <div className="text-lg font-medium text-gray-900">{value}</div>
          </dd>
        </dl>
      </div>
    </div>
  </div>
);

const PrizeCard = ({ rank, title, description, icon: Icon, color, image }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full transform hover:scale-105 transition-transform duration-300 group">
    <div className={`h-2 ${color}`} />
    <div className="relative flex justify-center items-center pt-8 px-4">
       {image ? (
         <div className="relative w-full h-48 flex items-center justify-center">
            <div className={`absolute w-32 h-32 rounded-full ${color.replace('bg-', 'bg-opacity-20 bg-')} filter blur-xl group-hover:bg-opacity-30 transition-all`}></div>
            <img 
              src={image} 
              alt={title} 
              className="relative z-10 w-auto h-full object-contain drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500" 
            />
         </div>
       ) : (
         <div className={`h-32 w-32 rounded-full flex items-center justify-center ${color.replace('bg-', 'bg-opacity-10 text-')}`}>
            <Icon className={`h-16 w-16 ${color.replace('bg-', 'text-')}`} />
         </div>
       )}
       <span className="absolute top-4 right-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-800 shadow-sm border border-gray-100 z-20">
        {rank} Lugar
      </span>
    </div>
    <div className="p-6 flex-1 flex flex-col items-center text-center">
      <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  </div>
);

const TicketNumber = ({ number, status, onSelect }) => {
  const formattedNumber = number.toString().padStart(3, '0');
  
  let baseClasses = "h-10 w-full rounded text-sm font-bold flex items-center justify-center transition-all duration-200 select-none cursor-pointer border";
  let statusClasses = "";

  if (status === 'sold') {
    statusClasses = "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed";
  } else if (status === 'selected') {
    statusClasses = "bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-110 z-10";
  } else {
    statusClasses = "bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:text-indigo-600";
  }

  return (
    <div 
      onClick={() => status !== 'sold' && onSelect(number)}
      className={`${baseClasses} ${statusClasses}`}
    >
      {formattedNumber}
    </div>
  );
};

// --- COMPONENTE ORÁCULO IA ---
const OracleView = ({ onAddNumbers, soldTickets }) => {
  const [inputContext, setInputContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handleConsult = async () => {
    if (!inputContext.trim()) return;
    setLoading(true);
    setPrediction(null);
    const result = await callGeminiOracle(inputContext);
    setLoading(false);
    if (result) {
      setPrediction(result);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl shadow-2xl overflow-hidden text-white relative">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
           <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
           <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
           <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm border border-white/20">
            <Sparkles className="h-8 w-8 text-yellow-300 mr-2" />
            <BrainCircuit className="h-6 w-6 text-purple-200" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-serif">El Oráculo de la Suerte</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto text-lg">
            ¿No sabes qué número elegir? Cuéntale a la IA tu sueño de anoche, tu fecha de nacimiento o simplemente cómo te sientes hoy. 
            El Oráculo interpretará las señales.
          </p>

          {!prediction ? (
            <div className="space-y-4 max-w-md mx-auto">
              <textarea
                value={inputContext}
                onChange={(e) => setInputContext(e.target.value)}
                placeholder="Ej: Soñé que ganaba la moto y viajaba a la playa..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white/20 transition-all h-32 resize-none"
              />
              <button
                onClick={handleConsult}
                disabled={loading || !inputContext.trim()}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-indigo-900 font-bold rounded-xl hover:from-yellow-300 hover:to-yellow-500 transition-all shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                {loading ? 'Consultando a los astros...' : 'Revelar mis Números'}
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
                <p className="text-xl font-medium text-yellow-300 mb-4 italic">"{prediction.message}"</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {prediction.numbers.map((num) => {
                    const isSold = soldTickets.has(num);
                    return (
                      <button
                        key={num}
                        onClick={() => !isSold && onAddNumbers(num)}
                        disabled={isSold}
                        className={`group relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 transition-all ${
                          isSold 
                            ? 'bg-gray-800/50 border-gray-600 opacity-50 cursor-not-allowed' 
                            : 'bg-white/20 border-yellow-400 hover:bg-yellow-400 hover:border-yellow-300 hover:scale-110 cursor-pointer'
                        }`}
                      >
                        <span className={`text-2xl font-bold ${isSold ? 'text-gray-400' : 'text-white group-hover:text-indigo-900'}`}>
                          {num.toString().padStart(3, '0')}
                        </span>
                        <span className={`text-xs mt-1 ${isSold ? 'text-gray-500' : 'text-yellow-200 group-hover:text-indigo-800'}`}>
                          {isSold ? 'Vendido' : 'Agregar'}
                        </span>
                        {!isSold && (
                           <div className="absolute -top-2 -right-2 bg-yellow-400 text-indigo-900 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                             <Ticket className="w-3 h-3" />
                           </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button 
                onClick={() => { setPrediction(null); setInputContext(''); }}
                className="text-indigo-200 hover:text-white underline text-sm"
              >
                Consultar otra vez
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [selectedTickets, setSelectedTickets] = useState([]);
  
  // Datos simulados de tickets vendidos para validación
  const soldTicketsSet = useMemo(() => new Set([15, 42, 100, 555, 777, 999, 123, 456, 888]), []);

  const tickets = useMemo(() => {
    return Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      status: soldTicketsSet.has(i) ? 'sold' : 'available'
    }));
  }, [soldTicketsSet]);

  const TICKET_PRICE = 3; 

  const handleTicketToggle = (number) => {
    setSelectedTickets(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        return [...prev, number];
      }
    });
  };

  const handleAddFromOracle = (number) => {
      if (!selectedTickets.includes(number)) {
          setSelectedTickets(prev => [...prev, number]);
      }
      // Pequeña notificación visual o feedback podría ir aquí
  };

  const totalAmount = selectedTickets.length * TICKET_PRICE;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24">
      
      {/* Barra de Navegación */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setActiveTab('inicio')}>
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-2">
                  <Ticket className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Gran Rifa SBR</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('inicio')}
                  className={`${activeTab === 'inicio' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                >
                  Inicio
                </button>
                <button
                  onClick={() => setActiveTab('comprar')}
                  className={`${activeTab === 'comprar' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                >
                  Comprar Tickets
                </button>
                {/* Nueva Pestaña IA */}
                <button
                  onClick={() => setActiveTab('oracle')}
                  className={`${activeTab === 'oracle' ? 'border-purple-500 text-purple-900' : 'border-transparent text-gray-500 hover:text-purple-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full group`}
                >
                  <Sparkles className="w-4 h-4 mr-1 text-purple-500 group-hover:animate-pulse" />
                  IA Mística
                </button>
              </div>
            </div>

             {/* Carrito Resumen (Escritorio) */}
             <div className="hidden sm:flex items-center">
                {selectedTickets.length > 0 && (
                  <div className="bg-indigo-50 px-4 py-1 rounded-full flex items-center text-indigo-700 text-sm font-medium mr-4 border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => setActiveTab('comprar')}>
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
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Móvil */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              <button
                onClick={() => { setActiveTab('inicio'); setIsMobileMenuOpen(false); }}
                className={`${activeTab === 'inicio' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
              >
                Inicio
              </button>
              <button
                onClick={() => { setActiveTab('comprar'); setIsMobileMenuOpen(false); }}
                className={`${activeTab === 'comprar' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
              >
                Comprar Tickets
              </button>
              <button
                onClick={() => { setActiveTab('oracle'); setIsMobileMenuOpen(false); }}
                className={`${activeTab === 'oracle' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'text-gray-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left flex items-center`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                IA Mística
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        
        {/* VISTA: INICIO */}
        {activeTab === 'inicio' && (
          <div className="space-y-8 px-4 sm:px-0">
            
            {/* Banner Hero */}
            <div className="relative bg-indigo-800 rounded-2xl shadow-xl overflow-hidden text-center sm:text-left">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-700 opacity-95"></div>
              {/* Círculos decorativos de fondo */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
              
              <div className="relative p-8 sm:p-12 z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="text-white space-y-4 max-w-2xl text-center md:text-left">
                  <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold uppercase tracking-wide mb-2">
                    Gran Sorteo Anual
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                    ¡Gana una <span className="text-yellow-300">Bera SBR 2025</span>!
                  </h2>
                  <p className="text-lg text-indigo-100 max-w-lg mx-auto md:mx-0">
                    La moto más codiciada del año puede ser tuya. Diseño renovado, color azul eléctrico y 0KM.
                    Solo quedan {1000 - 156} boletos.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button 
                      onClick={() => setActiveTab('comprar')}
                      className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-lg text-indigo-900 bg-white hover:bg-indigo-50 transition-all shadow-lg transform hover:-translate-y-1"
                    >
                      Comprar Boleto (${TICKET_PRICE})
                    </button>
                    {/* Botón Promocional IA */}
                    <button 
                      onClick={() => setActiveTab('oracle')}
                      className="inline-flex items-center justify-center px-6 py-3 border border-indigo-300/30 bg-indigo-900/50 text-base font-medium rounded-lg text-purple-100 hover:bg-indigo-900/70 transition-all backdrop-blur-sm"
                    >
                      <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                      Números Mágicos IA
                    </button>
                  </div>
                </div>
                
                {/* Imagen Hero - Moto Destacada */}
                <div className="mt-10 md:mt-0 relative w-full md:w-1/2 flex justify-center">
                   <div className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
                     {/* Círculo de brillo detrás de la moto */}
                     <div className="absolute inset-0 bg-blue-500 rounded-full filter blur-[60px] opacity-40"></div>
                     <img 
                        src="https://beravirtual.com/wp-content/uploads/2021/09/SBR-2025-AZUL-1-scaled.png" 
                        alt="Moto Bera SBR Azul" 
                        className="relative w-full object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                        style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
                     />
                   </div>
                </div>
              </div>
            </div>

            {/* Premios */}
            <div className="pt-8">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-extrabold text-gray-900">Premios Increíbles</h3>
                <p className="mt-2 text-gray-500">Tres oportunidades de ganar con tu mismo boleto</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PrizeCard 
                  rank="1er"
                  title="Moto SBR 2026"
                  description="Azul Eléctrico, 0KM, papeles al día + Casco certificado."
                  image="https://beravirtual.com/wp-content/uploads/2021/09/SBR-2025-AZUL-1-scaled.png"
                  color="bg-blue-600"
                />
                <PrizeCard 
                  rank="2do"
                  title="Smart TV 43''"
                  description="Samsung Crystal UHD 4K, Smart Hub, Bluetooth."
                  image="https://damasco.vtexassets.com/arquivos/ids/157034-1200-auto?v=638745470355600000"
                  color="bg-purple-500"
                />
                <PrizeCard 
                  rank="3er"
                  title="$100 Dólares"
                  description="Efectivo billetes nuevos o Zelle al instante."
                  icon={DollarSign}
                  color="bg-green-500"
                />
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <StatCard title="Boletos Vendidos" value="156 / 1000" icon={Ticket} color="bg-indigo-500" />
              <StatCard title="Fecha Sorteo" value="31 Diciembre" icon={Zap} color="bg-yellow-500" />
              <StatCard title="Valor del Boleto" value={`$${TICKET_PRICE}`} icon={DollarSign} color="bg-green-500" />
            </div>
          </div>
        )}

        {/* VISTA: ORÁCULO IA */}
        {activeTab === 'oracle' && (
          <OracleView onAddNumbers={handleAddFromOracle} soldTickets={soldTicketsSet} />
        )}

        {/* VISTA: COMPRAR TICKETS */}
        {activeTab === 'comprar' && (
          <div className="px-4 sm:px-0">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Selecciona tus Números</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Elige tus números de la suerte. (Gris = Vendido, Azul = Tu selección)
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-4 text-sm">
                   <div className="flex items-center"><span className="w-3 h-3 bg-white border border-gray-300 rounded mr-2"></span>Disponible</div>
                   <div className="flex items-center"><span className="w-3 h-3 bg-indigo-600 rounded mr-2"></span>Seleccionado</div>
                   <div className="flex items-center"><span className="w-3 h-3 bg-gray-200 rounded mr-2"></span>Vendido</div>
                </div>
              </div>
              
              {/* Grid de Tickets */}
              <div className="p-4 sm:p-6 bg-gray-50 max-h-[600px] overflow-y-auto">
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                  {tickets.map((ticket) => (
                    <TicketNumber
                      key={ticket.id}
                      number={ticket.id}
                      status={selectedTickets.includes(ticket.id) ? 'selected' : ticket.status}
                      onSelect={handleTicketToggle}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Barra de Pago Flotante (Móvil y Escritorio si hay selección) */}
      {selectedTickets.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-indigo-100 p-2 rounded-full mr-3 cursor-pointer" onClick={() => setActiveTab('comprar')}>
                <ShoppingCart className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total a Pagar</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalAmount} <span className="text-sm font-normal text-gray-500">({selectedTickets.length} boletos)</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center w-full sm:w-auto space-x-3">
               <div className="hidden md:flex flex-wrap gap-1 mr-4 max-w-xs justify-end">
                  {selectedTickets.slice(0, 5).map(n => (
                    <span key={n} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                      {n.toString().padStart(3, '0')}
                    </span>
                  ))}
                  {selectedTickets.length > 5 && <span className="text-xs text-gray-400">+{selectedTickets.length - 5} más</span>}
               </div>
              <button 
                onClick={() => setSelectedTickets([])}
                className="flex-1 sm:flex-none px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
              <button 
                onClick={() => alert(`¡Listo! Procesando compra por $${totalAmount} para los números: ${selectedTickets.map(n => n.toString().padStart(3,'0')).join(', ')}`)}
                className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transform active:scale-95 transition-all flex items-center justify-center"
              >
                Pagar Ahora <CheckCircle className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}