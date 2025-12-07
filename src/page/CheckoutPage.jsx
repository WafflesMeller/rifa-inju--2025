// src/page/CheckoutPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase.js";
import { createPortal } from "react-dom"; 
import ModalRecibo from "../components/ModalRecibo"; 
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Hash, 
  Receipt 
} from "lucide-react";

  
  // Input Helper con Icono
  const InputGroup = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          {...props}
          className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
        />
      </div>
    </div>
  );


// URL del Bot de WhatsApp
const BOT_API_URL = "https://whatsapp-server-rifa.onrender.com";

export default function CheckoutPage({
  selectedTickets = [],
  totalAmount = 0,
  onSuccess = () => {},
}) {
  const [tasaBCV, setTasaBCV] = useState(0);
  const [loadingTasa, setLoadingTasa] = useState(true);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    telefonoFamiliar: "",
    cedula: "",
    direccion: "",
    referencia: "",
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [datosVentaFinal, setDatosVentaFinal] = useState(null);

  // --- Lógica de Tasa y Cálculos ---
  useEffect(() => {
    let mounted = true;
    const fetchTasa = async () => {
      try {
        const res = await fetch("/api/tasa");
        if (!res.ok) throw new Error("Err");
        const data = await res.json();
        const precioOficial = data?.current?.eur || 65; // Fallback seguro
        if (mounted) setTasaBCV(precioOficial);
      } catch (err) {
        console.error(err);
        if (mounted) setTasaBCV(65);
      } finally {
        if (mounted) setLoadingTasa(false);
      }
    };
    fetchTasa();
    return () => { mounted = false; };
  }, []);

  const montoCalculado = tasaBCV > 0 ? totalAmount * tasaBCV : 0;
  const montoEnBs = parseFloat(montoCalculado.toFixed(2));

  const formatearBs = (valor) =>
    "Bs. " + valor.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  // --- Lógica de Copiado ---
  const copyPaymentDetails = async () => {
    const text = `Pago Móvil\nBanco: Venezuela (0102)\nTlf: 0424-292-9579\nCI: V-26.597.356\nMonto: ${formatearBs(montoEnBs)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMsg("No se pudo copiar automáticamente.");
    }
  };

  // --- Lógica de Envío ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (loadingTasa) return;
    if (!formData.nombre || !formData.telefono || !formData.referencia) {
      setErrorMsg("Por favor completa los campos obligatorios.");
      return;
    }

    setLoading(true);

    try {
 // 1. Calcular fecha límite (48h)
      const fechaLimite = new Date();
      fechaLimite.setHours(fechaLimite.getHours() - 48);
      const fechaISO = fechaLimite.toISOString();

      // B. Buscar el pago (SIN filtrar por 'usada' todavía)
      const { data: pagoData, error: pagoError } = await supabase
        .from("historial_pagos")
        .select("id, usada") // <--- IMPORTANTE: Traemos la columna 'usada' para ver su estado
        .like("referencia", `%${formData.referencia}`)
        .eq("monto_numerico", montoEnBs)
        .gte("created_at", fechaISO) // Solo últimos 2 días
        .order('created_at', { ascending: true }) // El más antiguo primero
        .limit(1);

      if (pagoError) throw pagoError;

      // 1️.1 VALIDACIÓN: ¿Existe el pago?
      if (!pagoData || pagoData.length === 0) {
        throw new Error("Pago no encontrado. Verifica los últimos 4 dígitos y que el monto sea exacto (últimas 48h).");
      }

      const pagoEncontrado = pagoData[0];

      // 1.2️ VALIDACIÓN: ¿Ya fue usado?
      if (pagoEncontrado.usada === true) {
        throw new Error("⚠️ Esta referencia ya fue reportada y procesada anteriormente.");
      }

      // Si pasamos aquí, el pago existe y está libre (usada === false)
      const pagoId = pagoEncontrado.id;

      // 1.5 VERIFICACIÓN FINAL DE DISPONIBILIDAD Antes de crear la venta, revisamos por última vez si alguien nos ganó
      const { data: ocupadosData, error: ocupadosError } = await supabase
        .from('tickets_vendidos')
        .select('numero')
        .in('numero', selectedTickets); // Buscamos si nuestros tickets ya existen

      if (ocupadosError) throw ocupadosError;

      if (ocupadosData && ocupadosData.length > 0) {
         const ticketsPerdidos = ocupadosData.map(t => t.numero).join(', ');
         throw new Error(`⛔ ¡Lo sentimos! El ticket ${ticketsPerdidos} acaba de ser vendido a otra persona hace un momento.`);
      }
      // =====================================================================

      // 2. Crear Venta
      const { data: ventaData, error: ventaError } = await supabase
        .from("ventas")
        .insert({
          nombre_cliente: formData.nombre,
          telefono: formData.telefono,
          cedula: formData.cedula,
          direccion: formData.direccion,
          telefono_familiar: formData.telefonoFamiliar,
          tickets_seleccionados: selectedTickets,
          monto_total: totalAmount,
          tasa_bcv: tasaBCV,
          monto_bs: montoEnBs,
          referencia_pago: formData.referencia,
          estado: "pagado",
        })
        .select("id")
        .single();

      if (ventaError) throw ventaError;

      // 3. ACTUALIZAR EL PAGO
      const { data: datosActualizados, error: updateError } = await supabase
        .from("historial_pagos")
        .update({ 
            usada: true, 
            venta_id: ventaData.id 
        }) 
        .eq("id", pagoId)
        .select(); // <--- IMPORTANTE: Esto nos devuelve la fila si se logró tocar

      if (updateError) {
          throw new Error("Error técnico al actualizar: " + updateError.message);
      }

      // 🔍 AQUÍ ESTÁ EL DIAGNÓSTICO
      if (!datosActualizados || datosActualizados.length === 0) {
          console.error("⛔ ALERTA: La operación update corrió, pero Supabase no modificó ninguna fila.");
          console.error("Causa probable: Políticas RLS bloqueando el UPDATE.");
          throw new Error("El sistema de seguridad bloqueó la actualización del pago.");
      }
      
      // PASO 4 NUEVO: Registrar tickets individuales
      
      // Preparamos el array de objetos para insertar todo de una vez
      const ticketsParaInsertar = selectedTickets.map((numero) => ({
        numero: numero,              // Columna 'numero' en tu tabla tickets_vendidos
        cedula_comprador: formData.cedula, // La cédula que pediste
        venta_id: ventaData.id             // IMPORTANTE: Vinculamos al ID de la venta principal
      }));

      const { error: ticketsError } = await supabase
        .from("tickets_vendidos")
        .insert(ticketsParaInsertar);

      if (ticketsError) {
        // Si falla esto, es crítico (tendrías una venta sin tickets reservados)
        throw new Error("Error reservando los números individuales: " + ticketsError.message);
      }

      // 5. Bot (Fire and forget)
      fetch(BOT_API_URL + "/enviar-mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          numero: formData.telefono, 
          mensaje: `Hola ${formData.nombre} 👋\n\n✅ Tu compra fue procesada con éxito.\n🎟️ Tickets: ${selectedTickets.join(", ")}\n🧾 ID de Recibo: #${ventaData.id}\n\n¡Mucha suerte! 🍀`
        }),
      }).catch(console.warn);

      const datosFinales = { ...ventaData, tickets: selectedTickets };
      setDatosVentaFinal(datosFinales);
      setMostrarConfirmacion(true);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  // --- Componentes UI Internos ---
// --- RENDERIZADO DEL MODAL DE ÉXITO ---
if (mostrarConfirmacion) {
  // Usamos el Portal para sacarlo al body y que se vea ENCIMA del otro modal
  return createPortal(
    <ModalRecibo 
      isOpen={true}
      data={datosVentaFinal}
      onClose={() => {
          // Esto limpia y cierra todo
          onSuccess(datosVentaFinal); 
      }}
    />,
    document.body
  );
}
  return (
    <div className="flex flex-col lg:flex-row min-h-full bg-white">
      
      {/* ---------------------------------------------------- */}
      {/* SECCIÓN IZQUIERDA (Desktop) / SUPERIOR (Mobile):     */}
      {/* Resumen de Compra y Datos Bancarios                  */}
      {/* ---------------------------------------------------- */}
      <div className="w-full lg:w-5/12 bg-slate-50 border-b lg:border-b-0 lg:border-r border-gray-200 p-6 lg:p-8 order-1 lg:order-1">
    
        <h2 className="text-xl font-bold text-slate-800 mb-1">Resumen del Pedido</h2>
        <p className="text-sm text-slate-500 mb-6">Revisa los detalles antes de pagar.</p>

        {/* Tarjeta de Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-600">Tickets Seleccionados</span>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold">
              x{selectedTickets.length}
            </span>
          </div>
          <p className="text-slate-800 font-mono text-sm leading-relaxed">
            {selectedTickets.join(", ")}
          </p>
          <div className="my-3 border-t border-dashed border-gray-200" />
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500">Tasa BCV</p>
              <p className="text-sm font-medium text-gray-700">
                {loadingTasa ? "..." : formatearBs(tasaBCV)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Total a Pagar</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {loadingTasa ? "Calculando..." : formatearBs(montoEnBs)}
              </p>
              <p className="text-xs text-gray-400 font-medium">({totalAmount} EUR)</p>
            </div>
          </div>
        </div>

        {/* Tarjeta de Datos Bancarios (Estilo Visual) */}
        <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 text-white p-5 shadow-lg">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          
          <div className="flex items-center gap-2 mb-4 opacity-90">
            <Receipt className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wide uppercase">Pago Móvil</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-white/20 pb-1">
              <span className="text-emerald-100">Banco</span>
              <span className="font-semibold">Venezuela (0102)</span>
            </div>
            <div className="flex justify-between border-b border-white/20 pb-1">
              <span className="text-emerald-100">Teléfono</span>
              <span className="font-semibold font-mono">0424-292-9579</span>
            </div>
            <div className="flex justify-between border-b border-white/20 pb-1">
              <span className="text-emerald-100">Cédula</span>
              <span className="font-semibold font-mono">V-26.597.356</span>
            </div>
          </div>

          <button 
            onClick={copyPaymentDetails}
            className="mt-4 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-lg py-2 px-4 text-sm font-medium transition flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "¡Datos Copiados!" : "Copiar Datos Bancarios"}
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECCIÓN DERECHA (Desktop) / INFERIOR (Mobile):       */}
      {/* Formulario de Usuario                                */}
      {/* ---------------------------------------------------- */}
      <div className="w-full lg:w-7/12 p-6 lg:p-8 bg-white order-2 lg:order-2">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Validación del Pago</h2>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Fila 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputGroup 
              label="Cédula" 
              name="cedula" 
              icon={CreditCard} 
              placeholder="V-12345678" 
              required 
              value={formData.cedula} 
              onChange={handleChange} 
            />
            <InputGroup 
              label="Nombre Completo" 
              name="nombre" 
              icon={User} 
              placeholder="Ej: Juan Pérez" 
              required 
              value={formData.nombre} 
              onChange={handleChange} 
            />
            
          </div>

          {/* Fila 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputGroup 
              label="Teléfono (WhatsApp)" 
              name="telefono" 
              icon={Phone} 
              placeholder="0412..." 
              type="tel" 
              required 
              value={formData.telefono} 
              onChange={handleChange} 
            />
             <InputGroup 
              label="Tlf. Respaldo (Opcional)" 
              name="telefonoFamiliar" 
              icon={Phone} 
              placeholder="0414..." 
              type="tel" 
              value={formData.telefonoFamiliar} 
              onChange={handleChange} 
            />
          </div>

          {/* Dirección */}
          <InputGroup 
            label="Dirección" 
            name="direccion" 
            icon={MapPin} 
            placeholder="Estado, Ciudad, Zona..." 
            required 
            value={formData.direccion} 
            onChange={handleChange} 
          />

          <hr className="border-gray-100 my-6" />

          {/* Campo Crítico: Referencia */}
          <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
            <label className="block text-sm font-semibold text-indigo-900 mb-2">
              Últimos 4 dígitos de la Referencia
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-indigo-400" />
              </div>
              <input
                required
                name="referencia"
                value={formData.referencia}
                onChange={handleChange}
                maxLength={4} // A veces meten mas, pero limitamos visualmente
                placeholder="0000"
                className="block w-full pl-12 pr-4 py-3 bg-white border border-indigo-200 rounded-lg text-indigo-900 placeholder-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-xl font-mono tracking-[0.2em] transition-all"
              />
            </div>
            <p className="text-xs text-indigo-600/80 mt-2">
              * Ingresa los últimos 4 dígitos del número de referencia de tu pago móvil.
            </p>
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading || loadingTasa}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || loadingTasa
                ? "bg-gray-400 cursor-not-allowed transform-none shadow-none"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Confirmar Pago</span>
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}