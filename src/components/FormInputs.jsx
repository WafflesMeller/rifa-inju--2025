// src/components/Inputs.jsx
import React from "react";
import { ChevronDown, CreditCard } from "lucide-react";

/**
 * TextInput: input de texto normal con icono opcional dentro (ej: nombre, dirección)
 */
export const TextInput = ({ label, icon: Icon, id, className = "", ...props }) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">
        {label}
      </label>

      <div className="relative group">
        {/* Icono a la izquierda (opcional) */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {Icon && <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />}
        </div>

        <input
          id={id}
          {...props}
          className={`block w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm`}
        />
      </div>
    </div>
  );
};

/**
 * CedulaInput: selector V/E + número
 * - Quité el icono dentro del input numérico para que se vea más limpio
 */
export const CedulaInput = ({ value, onChange, name, label = "Cédula", required, id }) => {
  const safeValue = value || "V";
  const [tipo, numero] = safeValue.includes("-") ? safeValue.split("-") : ["V", ""];

  const triggerChange = (newTipo, newNumero) => {
    onChange?.({
      target: { name: name, value: `${newTipo}-${newNumero}` }
    });
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">{label}</label>

      <div className="flex rounded-lg overflow-hidden">
        {/* Select V/E */}
        <div className="relative">
          <select
            id={id ? `${id}-tipo` : undefined}
            value={tipo}
            onChange={(e) => triggerChange(e.target.value, numero)}
            className="h-full rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 py-2 pl-3 pr-7 text-gray-600 font-bold focus:ring-2 focus:ring-indigo-500/20 sm:text-sm outline-none appearance-none cursor-pointer"
          >
            <option value="V">V</option>
            <option value="E">E</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Input número (sin icono interno) */}
        <div className="relative grow">
          <input
            id={id ? `${id}-numero` : undefined}
            type="text"
            inputMode="numeric"
            value={numero}
            required={required}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 8);
              triggerChange(tipo, val);
            }}
            placeholder="12345678"
            className="block w-full rounded-r-lg border border-gray-200 pl-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm outline-none"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * PhoneInput: selector de prefijo + número
 * - Quité el icono dentro del input; select mantiene chevron
 */
export const PhoneInput = ({ value, onChange, name, label = "Teléfono", required, id }) => {
  const safeValue = value || "0412-";
  const [prefijo, numero] = safeValue.includes("-") ? safeValue.split("-") : ["0412", ""];
  const prefijos = ["0412", "0414", "0424", "0416", "0426", "0422"];

  const triggerChange = (newPrefijo, newNumero) => {
    onChange?.({
      target: { name: name, value: `${newPrefijo}${newNumero}` }
    });
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">{label}</label>

      <div className="flex  rounded-lg overflow-hidden">
        {/* Select de prefijo */}
        <div className="relative">
          <select
            id={id ? `${id}-prefijo` : undefined}
            value={prefijo}
            onChange={(e) => triggerChange(e.target.value, numero)}
            className="h-full rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 py-2 pl-3 pr-7 text-gray-600 font-medium focus:ring-2 focus:ring-indigo-500/20 sm:text-sm outline-none appearance-none cursor-pointer"
          >
            {prefijos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Input número (limpio, sin icono) */}
        <div className="relative grow">
          <input
            id={id ? `${id}-numero` : undefined}
            type="text"
            inputMode="numeric"
            value={numero}
            required={required}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 7);
              triggerChange(prefijo, val);
            }}
            placeholder="1234567"
            className="block w-full rounded-r-lg border border-gray-200 pl-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm outline-none"
          />
        </div>
      </div>
    </div>
  );
};
