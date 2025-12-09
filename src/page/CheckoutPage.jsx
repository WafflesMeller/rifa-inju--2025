// src/page/CheckoutPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase.js';
import { createPortal } from 'react-dom';
import ModalRecibo from '../components/ModalRecibo';
// 1️⃣ CÁMARA: Importamos la librería
import { toBlob } from 'html-to-image'; 

// 2️⃣ ICONOS: Agregué CheckCircle, Calendar y Sparkles que faltaban y causaban el error
import { Copy, Check, User, Phone, MapPin, CreditCard, Hash, Receipt, CheckCircle, Calendar, Sparkles } from 'lucide-react';

import { TextInput, CedulaInput, PhoneInput } from '../components/FormInputs';

// URL del Bot de WhatsApp
const BOT_API_URL = 'https://whatsapp-server-rifa.onrender.com';

export default function CheckoutPage({ selectedTickets = [], totalAmount = 0, onSuccess = () => {} }) {
  const [tasaBCV, setTasaBCV] = useState(0);
  const [loadingTasa, setLoadingTasa] = useState(true);

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    telefonoFamiliar: '',
    cedula: '',
    direccion: '',
    referencia: '',
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [datosVentaFinal, setDatosVentaFinal] = useState(null);

  // 3️⃣ ESTADO: Necesario para el Ticket Fantasma
  const [receiptData, setReceiptData] = useState(null);
  const receiptRef = useRef(null);

  // --- Lógica de Tasa y Cálculos ---
  useEffect(() => {
    let mounted = true;
    const fetchTasa = async () => {
      try {
        const res = await fetch('/api/tasa');
        if (!res.ok) throw new Error('Err');
        const data = await res.json();
        const precioOficial = data?.current?.eur;
        if (mounted) setTasaBCV(precioOficial);
      } catch (err) {
        console.error(err);
        if (mounted) setTasaBCV(300.51);
      } finally {
        if (mounted) setLoadingTasa(false);
      }
    };
    fetchTasa();
    return () => {
      mounted = false;
    };
  }, []);

  const montoCalculado = tasaBCV > 0 ? totalAmount * tasaBCV : 0;
  const montoEnBs = parseFloat(montoCalculado.toFixed(2));

  const formatearBs = (valor) =>
    'Bs. ' + valor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
      setErrorMsg('No se pudo copiar automáticamente.');
    }
  };

  // --- Abrir Link Universal BDV ---
  const abrirLinkBDV = () => {
    const RECEPTOR_ID = 'V26597356';
    const RECEPTOR_TLF = '584242929579';
    const RECEPTOR_BANCO = '0102';
    const montoFormateado = montoEnBs.toFixed(2);
    const descripcion = '9dxBliWt4XnVSB0LTqNasQ%3D%3D';
    const linkBDV = `https://bdvdigital.banvenez.com/pagomovil?id=${RECEPTOR_ID}&phone=${RECEPTOR_TLF}&bank=${RECEPTOR_BANCO}&description=${descripcion}&amount=${montoFormateado}`;
    window.open(linkBDV, '_blank');
  };

  // --- Lógica de Envío BLINDADA ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    let ventaIdCreada = null;
    let pagoIdUsado = null;

    if (loadingTasa) return;

    if (!formData.nombre || !formData.telefono || !formData.referencia) {
      setErrorMsg('Por favor completa los campos obligatorios.');
      return;
    }

    const PRECIO_BASE = 3; 
    const montoEsperado = selectedTickets.length * PRECIO_BASE * tasaBCV;

    if (Math.abs(montoEsperado - montoEnBs) > 1.0) {
      setErrorMsg('⚠️ Error de seguridad: El monto no coincide con la cantidad de tickets.');
      return;
    }

    setLoading(true);

    try {
      const fechaLimite = new Date();
      fechaLimite.setHours(fechaLimite.getHours() - 48);
      const fechaISO = fechaLimite.toISOString();

      // 1. BUSCAR Y VALIDAR EL PAGO
      const { data: pagoData, error: pagoError } = await supabase
        .from('historial_pagos')
        .select('id, usada')
        .like('referencia', `%${formData.referencia}`)
        .eq('monto_numerico', montoEnBs)
        .gte('created_at', fechaISO)
        .order('created_at', { ascending: true })
        .limit(1);

      if (pagoError) throw pagoError;

      if (!pagoData || pagoData.length === 0) {
        throw new Error('Pago no encontrado. Verifica los últimos 4 dígitos y el monto exacto.');
      }

      const pagoEncontrado = pagoData[0];

      if (pagoEncontrado.usada === true) {
        throw new Error('⚠️ Esta referencia ya fue reportada y procesada anteriormente.');
      }

      pagoIdUsado = pagoEncontrado.id;

      // 1.5. VERIFICACIÓN FINAL DE DISPONIBILIDAD
      const { data: ocupadosData, error: ocupadosError } = await supabase
        .from('tickets_vendidos')
        .select('numero')
        .in('numero', selectedTickets);

      if (ocupadosError) throw ocupadosError;

      if (ocupadosData && ocupadosData.length > 0) {
        const ticketsPerdidos = ocupadosData.map((t) => t.numero).join(', ');
        throw new Error(`⛔ ¡Lo sentimos! El ticket ${ticketsPerdidos} acaba de ser ganado por otra persona.`);
      }

      // 2. CREAR LA VENTA
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert({
          nombre_cliente: formData.nombre.trim().toUpperCase(),
          telefono: formData.telefono,
          cedula: formData.cedula,
          direccion: formData.direccion,
          telefono_familiar: formData.telefonoFamiliar,
          tickets_seleccionados: selectedTickets,
          monto_total: totalAmount,
          tasa_bcv: tasaBCV,
          monto_bs: montoEnBs,
          referencia_pago: formData.referencia,
          estado: 'pagado',
        })
        .select('id')
        .single();

      if (ventaError) throw ventaError;

      ventaIdCreada = ventaData.id;

      // 3. ACTUALIZAR EL PAGO
      const { data: datosActualizados, error: updateError } = await supabase
        .from('historial_pagos')
        .update({
          usada: true,
          venta_id: ventaData.id,
        })
        .eq('id', pagoIdUsado)
        .select();

      if (updateError) throw new Error('Error técnico al actualizar pago: ' + updateError.message);

      if (!datosActualizados || datosActualizados.length === 0) {
        throw new Error('El sistema de seguridad bloqueó la actualización del pago.');
      }

      // 4. REGISTRAR TICKETS INDIVIDUALES
      const ticketsParaInsertar = selectedTickets.map((numero) => ({
        numero: numero,
        cedula_comprador: parseInt(formData.cedula.replace(/\D/g, '')),
        venta_id: ventaData.id,
      }));

      const { error: ticketsError } = await supabase.from('tickets_vendidos').insert(ticketsParaInsertar);

      if (ticketsError) {
        if (ticketsError.code === '23505') {
          throw new Error('Error crítico: Uno de los tickets ya fue vendido.');
        }
        throw new Error('Error reservando tickets: ' + ticketsError.message);
      }

      // =========================================================================
      // 📸 4.5. GENERAR LA IMAGEN (Aquí estaba el fallo original)
      // =========================================================================
      
      const fechaHoy = new Date().toLocaleDateString('es-VE');
      const ticketsListados = selectedTickets.map(t => `🔹 [${t}]`).join('\n');

      // A. Rellenamos los datos del ticket fantasma
      setReceiptData({
        id: ventaData.id,
        nombre: formData.nombre,
        tickets: selectedTickets,
        fecha: new Date().toISOString()
      });

      // B. Esperamos un momento a que React pinte el ticket oculto
      await new Promise(resolve => setTimeout(resolve, 100));

      // C. Tomamos la foto
      let imageBlob = null;
      try {
        if (receiptRef.current) {
          imageBlob = await toBlob(receiptRef.current, {
            cacheBust: true,
            backgroundColor: '#ffffff',
            pixelRatio: 2
          });
        }
      } catch (err) {
        console.error("Error al generar la imagen del ticket:", err);
      }

      // =========================================================================
      // 5. ENVIAR AL BOT
      // =========================================================================
      
      if (imageBlob) {
        const data = new FormData();
        data.append('numero', formData.telefono);
        data.append('mensaje', `✅ *CONFIRMACIÓN DE COMPRA*

Hola, *${formData.nombre}*.
Le informamos que hemos recibido y procesado su pago *correctamente* en nuestro sistema. Su participación en el sorteo ha quedado *confirmada y asegurada*.

A continuación, su comprobante digital:
🆔 *Pago N°:* #LG2025${ventaData.id}
📅 *Fecha:* ${fechaHoy}
👤 *Titular:* ${formData.nombre}

🎟 *SU(S) NUMERO(S):*
${ticketsListados}

Estos números ya son suyos y nadie más podrá adquirirlos.

Agradecemos su confianza en 🎰 *La Gran Rifa 2025*. Le deseamos el mayor de los éxitos en el sorteo.

Si tiene alguna duda, este es nuestro canal oficial de atención.`);
        
        data.append('media', imageBlob, `ticket-${ventaData.id}.png`);

        await fetch(BOT_API_URL + '/enviar-mensaje-media', { 
          method: 'POST',
          body: data 
        }).catch(console.warn);

      } else {
        // Fallback
        await fetch(BOT_API_URL + '/enviar-mensaje', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              numero: formData.telefono,
              mensaje: `✅ *CONFIRMACIÓN DE COMPRA (Sin imagen)*\n\nHola, *${formData.nombre}*.\nPago N°: #LG2025${ventaData.id}\nTickets: ${selectedTickets.join(', ')}`
            }),
        }).catch(console.warn);
      }

      const datosFinales = { ...ventaData, tickets: selectedTickets };
      setDatosVentaFinal(datosFinales);
      setMostrarConfirmacion(true);

    } catch (err) {
      console.error(err);

      if (ventaIdCreada) {
        await supabase.from('ventas').delete().eq('id', ventaIdCreada);
      }
      if (pagoIdUsado) {
        await supabase.from('historial_pagos').update({ usada: false, venta_id: null }).eq('id', pagoIdUsado);
      }

      setErrorMsg(
        err.message || 'Error al procesar el pago. Por favor revise su conexión a internet e inténtelo nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (mostrarConfirmacion) {
    return createPortal(
      <ModalRecibo
        isOpen={true}
        data={datosVentaFinal}
        onClose={() => {
          onSuccess(datosVentaFinal);
        }}
      />,
      document.body
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-full bg-white">
      {/* SECCIÓN IZQUIERDA: Resumen */}
      <div className="w-full lg:w-5/12 bg-slate-50 border-b lg:border-b-0 lg:border-r border-gray-200 p-3 lg:p-4 order-1 lg:order-1">
        <h2 className="text-xl font-bold text-slate-800">Resumen del Pedido</h2>
        <p className="text-sm text-slate-500 mb-3">Revisa los detalles antes de pagar.</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-600">Tickets Seleccionados</span>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold">
              x{selectedTickets.length}
            </span>
          </div>
          <p className="text-slate-800 font-mono text-sm leading-relaxed">{selectedTickets.join(', ')}</p>
          <div className="my-3 border-t border-dashed border-gray-200" />
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500">Tasa Euro BCV</p>
              <p className="text-sm font-medium text-gray-700">{loadingTasa ? '...' : formatearBs(tasaBCV)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Total a Pagar</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {loadingTasa ? 'Calculando...' : formatearBs(montoEnBs)}
              </p>
              <p className="text-xs text-gray-400 font-medium">({totalAmount} REF)</p>
            </div>
          </div>
        </div>

        {/* Tarjeta Banco */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 shadow-lg">
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
            className="mt-4 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-lg py-2 px-4 text-sm font-medium transition flex items-center justify-center gap-2 hover:scale-105 "
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Datos Copiados!' : 'Copiar Datos Bancarios'}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={abrirLinkBDV}
            className="group w-full bg-white font-medium py-2.5 px-4 rounded-xl border border-gray-300 hover:scale-102 text-gray-800 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <img
              src="/bdv-logo.png"
              alt="BDV"
              className="w-5 h-5 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-sm">Pagar con BDV</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formulario */}
      <div className="w-full lg:w-7/12 p-3 lg:p-4 bg-white order-2 lg:order-2">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Validación del Pago</h2>
        {errorMsg && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <CedulaInput label="Cédula" name="cedula" value={formData.cedula} onChange={handleChange} required />
            <TextInput
              label="Nombre Completo"
              name="nombre"
              icon={User}
              placeholder="Ej: Juan Pérez"
              required
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <PhoneInput
              label="Teléfono WhatsApp"
              name="telefono"
              required
              value={formData.telefono}
              onChange={handleChange}
            />
            <PhoneInput
              label="Tlf. Respaldo (Opcional)"
              name="telefonoFamiliar"
              value={formData.telefonoFamiliar}
              onChange={handleChange}
            />
          </div>

          <TextInput
            label="Dirección"
            name="direccion"
            icon={MapPin}
            placeholder="Estado, Ciudad, Zona..."
            required
            value={formData.direccion}
            onChange={handleChange}
          />

          <hr className="border-gray-100 my-3" />

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
                maxLength={4}
                placeholder="0000"
                className="block w-full pl-12 pr-4 py-3 bg-white border border-indigo-200 rounded-lg text-indigo-900 placeholder-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-xl font-mono tracking-[0.2em] transition-all uppercase"
              />
            </div>
            <p className="text-xs text-indigo-600/80 mt-2">
              * Ingresa los últimos 4 dígitos del número de referencia de tu pago móvil.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || loadingTasa}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || loadingTasa
                ? 'bg-gray-400 cursor-not-allowed transform-none shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-102'
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

      {/* ==================================================================================
          👻 TICKET FANTASMA (Solo se ve cuando se va a tomar la foto)
      ================================================================================== */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: '-9999px',
          width: '500px'
        }}
      >
        {receiptData && (
          <div ref={receiptRef} className="relative bg-white rounded-3xl overflow-hidden shadow-2xl font-poppins text-gray-900">
            <div className="h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Comprador</p>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-indigo-500" />
                    {receiptData.nombre}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 mb-1">
                    <CheckCircle className="w-4 h-4" /> PAGADO
                  </div>
                  <p className="text-sm text-gray-400 font-mono">Recibo #{receiptData.id}</p>
                </div>
              </div>

              <div className="relative flex items-center justify-center my-8">
                <div className="absolute -left-12 w-8 h-8 bg-white border-r border-gray-200 rounded-full"></div> 
                <div className="w-full border-t-4 border-dashed border-gray-200"></div>
                <div className="absolute -right-12 w-8 h-8 bg-white border-l border-gray-200 rounded-full"></div> 
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Tus Números Oficiales:
                </p>
                <div className="flex flex-wrap gap-3">
                  {receiptData.tickets.map((num) => (
                    <div key={num} className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 flex flex-col items-center min-w-[90px]">
                      <span className="text-xs text-gray-400 uppercase font-bold">Ticket</span>
                      <span className="text-3xl font-black text-gray-800 tracking-tighter">{num}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(receiptData.fecha).toLocaleDateString('es-VE')}
                </span>
                <span className="font-bold text-indigo-300">LA GRAN RIFA 2025</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}