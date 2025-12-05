// src/page/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CheckoutPage({ selectedTickets, totalAmount, onBack, onSuccess }) {
  
  // --- ESTADOS PARA LA TASA ---
  const [tasaBCV, setTasaBCV] = useState(0); 
  const [loadingTasa, setLoadingTasa] = useState(true);

  // --- EFECTO: OBTENER TASA AL CARGAR ---
  useEffect(() => {
    const fetchTasa = async () => {
      try {
        // Llamamos a TU backend que lee el BCV
        const response = await fetch('/api/tasa');
        
        // Si la respuesta de red no es ok, lanzamos error para que lo atrape el catch
        if (!response.ok) throw new Error('Error en la respuesta del servidor');

        const data = await response.json();

        // --- CORRECCIÓN CLAVE AQUÍ ---
        // Usamos ?. para verificar paso a paso. 
        // Si data.current es undefined, no explota, simplemente salta al 65.
        const precioOficial = data?.current?.usd || 65;

        setTasaBCV(precioOficial);

      } catch (error) {
        console.error("Error conectando con API tasa:", error);
        // Si falla todo (red caída, json mal formado), usamos tasa de emergencia
        setTasaBCV(65); 
      } finally {
        // Esto asegura que el spinner de carga se quite SIEMPRE
        setLoadingTasa(false);
      }
    };

    fetchTasa();
  }, []);
  // --- CÁLCULOS MATEMÁTICOS ---
  // Si la tasa es 0 o está cargando, el monto en Bs es 0 por seguridad
  const montoEnBs = tasaBCV > 0 ? totalAmount * tasaBCV : 0;

  // Función para formato "Bs. 1.200,50"
  const formatearBs = (valor) => {
    return "Bs. " + valor.toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };
  // -----------------------------

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    telefonoFamiliar: '',
    cedula: '',
    direccion: '',
    referencia: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (tasaBCV === 0) {
      alert("⚠️ Espera a que cargue la tasa del BCV antes de enviar.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('ventas')
        .insert({
          nombre_cliente: formData.nombre,
          telefono: formData.telefono,
          cedula: formData.cedula,
          direccion: formData.direccion,
          telefono_familiar: formData.telefonoFamiliar,
          
          tickets_seleccionados: selectedTickets,
          monto_total: totalAmount, // Monto en Dólares/Euros original
          
          // --- GUARDAMOS LA CONVERSIÓN ---
          tasa_bcv: tasaBCV,
          monto_bs: montoEnBs,
          // -------------------------------

          referencia_pago: formData.referencia,
          estado: 'pendiente'
        });

      if (error) throw error;

      alert(`✅ ¡Venta registrada!\nPor favor transfiere: ${formatearBs(montoEnBs)}`);
      onSuccess();

    } catch (error) {
      console.error("Error registrando venta:", error);
      alert("❌ Hubo un error al registrar tu compra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-6 mb-20">
      <button onClick={onBack} className="text-gray-500 mb-4 hover:text-gray-800">
        ← Volver a la selección
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirmar y Pagar</h2>

      {/* RESUMEN DE COMPRA */}
      <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-2">Resumen del Pedido</h3>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Tickets ({selectedTickets.length}):</strong> {selectedTickets.join(", ")}
        </p>
        
        <div className="flex justify-between items-end border-t border-blue-200 pt-2 mt-2">
            <div>
                <p className="text-sm text-gray-500">Total en Divisa:</p>
                <p className="text-xl font-bold text-gray-800">${totalAmount}</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500">Tasa BCV:</p>
                {loadingTasa ? (
                   <span className="text-xs text-gray-500 animate-pulse">Cargando...</span>
                ) : (
                   <p className="text-md font-medium text-gray-800">{formatearBs(tasaBCV)}</p>
                )}
            </div>
        </div>
      </div>

      {/* CALCULADORA DE PAGO MÓVIL (Visualmente Destacado) */}
      <div className="mb-8 border-l-4 border-green-500 bg-green-50 p-5 shadow-sm">
        <h4 className="font-bold text-green-900 text-lg mb-2">📲 Monto a Pagar</h4>
        
        <p className="text-sm text-gray-700 mb-3">
          Por favor realiza el pago móvil por el monto exacto en Bolívares:
        </p>

        <p className="text-3xl font-extrabold text-green-700 mb-4">
          {loadingTasa ? (
            <span className="text-lg text-gray-500 animate-pulse">🔄 Consultando BCV...</span>
          ) : (
            formatearBs(montoEnBs)
          )}
        </p>

        <div className="bg-white p-3 rounded border border-green-200 text-sm space-y-1">
          <p><strong>Banco:</strong> Banco de Venezuela (0102)</p>
          <p><strong>Teléfono:</strong> 0412-123-4567</p>
          <p><strong>Cédula:</strong> V-12.345.678</p>
        </div>
      </div>

      {/* FORMULARIO DE REPORTE */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Tus Datos</h3>
            
            {/* Nombre */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input 
                  required type="text" name="nombre"
                  value={formData.nombre} onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Ej: Juan Pérez"
              />
            </div>

            {/* Cédula y Teléfono */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                  <label className="block text-sm font-medium text-gray-700">Cédula</label>
                  <input 
                  required type="text" name="cedula"
                  value={formData.cedula} onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="V-..."
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Tu Teléfono</label>
                  <input 
                  required type="tel" name="telefono"
                  value={formData.telefono} onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="0412..."
                  />
              </div>
            </div>

            {/* Datos Extra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                  <label className="block text-sm font-medium text-gray-700">Tlf. Familiar</label>
                  <input 
                  required type="tel" name="telefonoFamiliar"
                  value={formData.telefonoFamiliar} onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  />
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <textarea 
                  required name="direccion"
                  value={formData.direccion} onChange={handleChange}
                  rows="2"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Estado, Ciudad, Municipio..."
                  />
              </div>
            </div>
        </div>

        {/* Referencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Referencia de Pago (4 últimos dígitos)</label>
          <input 
            required type="text" name="referencia"
            value={formData.referencia} onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md font-mono text-lg tracking-widest"
            placeholder="0000"
            maxLength={8}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || loadingTasa}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400 text-lg shadow-lg"
        >
          {loading ? "Registrando..." : "CONFIRMAR PAGO"}
        </button>
      </form>
    </div>
  );
}