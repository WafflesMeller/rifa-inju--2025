// src/page/CheckoutPage.jsx
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CheckoutPage({ selectedTickets, totalAmount, onBack, onSuccess }) {
  // 1. Agregamos direccion y telefonoFamiliar al estado
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    telefonoFamiliar: '', // <--- NUEVO
    cedula: '',
    direccion: '',        // <--- NUEVO
    referencia: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 2. Enviamos los nuevos datos a Supabase
      const { data, error } = await supabase
        .from('ventas')
        .insert({
          nombre_cliente: formData.nombre,
          telefono: formData.telefono,
          cedula: formData.cedula,
          // Mapeamos los nuevos campos:
          direccion: formData.direccion,
          telefono_familiar: formData.telefonoFamiliar,
          
          tickets_seleccionados: selectedTickets,
          monto_total: totalAmount,
          referencia_pago: formData.referencia,
          estado: 'pendiente'
        });

      if (error) throw error;

      alert("✅ ¡Venta registrada! Tu compra está en revisión.");
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

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirmar Compra</h2>

      {/* RESUMEN */}
      <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-2">Resumen del Pedido</h3>
        <p className="text-sm text-gray-600">
          <strong>Tickets:</strong> {selectedTickets.join(", ")}
        </p>
        <p className="text-xl font-bold text-blue-900 mt-2">
          Total a Pagar: ${totalAmount}
        </p>
      </div>

      {/* DATOS DE PAGO */}
      <div className="mb-8 border-l-4 border-yellow-400 bg-yellow-50 p-4">
        <h4 className="font-bold text-yellow-800">📲 Datos Pago Móvil</h4>
        <ul className="text-sm text-gray-700 mt-1 space-y-1">
          <li><strong>Banco:</strong> Banco de Venezuela (0102)</li>
          <li><strong>Teléfono:</strong> 0412-123-4567</li>
          <li><strong>Cédula:</strong> V-12.345.678</li>
        </ul>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
          <input 
            required type="text" name="nombre"
            value={formData.nombre} onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="Ej: Juan Pérez"
          />
        </div>

        {/* Cédula y Teléfono Principal */}
        <div className="grid grid-cols-2 gap-4">
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

        {/* 3. NUEVOS CAMPOS VISUALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Teléfono Familiar */}
           <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono Familiar (Respaldo)</label>
            <input 
              required type="tel" name="telefonoFamiliar"
              value={formData.telefonoFamiliar} onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Otro número de contacto"
            />
          </div>
           {/* Dirección */}
           <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Dirección de Habitación</label>
            <textarea 
              required name="direccion"
              value={formData.direccion} onChange={handleChange}
              rows="2"
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Estado, Ciudad, Sector..."
            />
          </div>
        </div>

        {/* Referencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Referencia de Pago (4 últimos dígitos)</label>
          <input 
            required type="text" name="referencia"
            value={formData.referencia} onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md font-mono"
            placeholder="Ej: 1234"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
        >
          {loading ? "Procesando..." : "REPORTAR PAGO"}
        </button>
      </form>
    </div>
  );
}