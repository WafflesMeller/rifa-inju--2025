import React from "react";
import { ChevronDown, CreditCard, Phone } from "lucide-react";

// 1. INPUT DE TEXTO NORMAL (Nombre, Dirección, Referencia)
export const TextInput = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {Icon && <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />}
      </div>
      <input
        {...props}
        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
      />
    </div>
  </div>
);

// 2. INPUT DE CÉDULA (Selector V/E + Números)
export const CedulaInput = ({ value, onChange, name, label = "Cédula", required }) => {
  // Desglosamos "V-123456" -> ["V", "123456"]
  // Si viene vacío, ponemos valores seguros por defecto
  const safeValue = value || "V-"; 
  const [tipo, numero] = safeValue.includes("-") ? safeValue.split("-") : ["V", ""];

  const triggerChange = (newTipo, newNumero) => {
    onChange({
      target: { name: name, value: `${newTipo}-${newNumero}` }
    });
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">{label}</label>
      <div className="flex shadow-sm rounded-lg">
        <div className="relative">
          <select
            value={tipo}
            onChange={(e) => triggerChange(e.target.value, numero)}
            className="h-full rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 py-0 pl-3 pr-7 text-gray-600 font-bold focus:ring-2 focus:ring-indigo-500/20 sm:text-sm outline-none appearance-none cursor-pointer"
          >
            <option value="V">V</option>
            <option value="E">E</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-3 w-3 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CreditCard className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={numero}
            required={required}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 8); // Solo numeros, max 8
              triggerChange(tipo, val);
            }}
            placeholder="12345678"
            className="block w-full rounded-r-lg border border-gray-200 pl-10 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm outline-none"
          />
        </div>
      </div>
    </div>
  );
};

// 3. INPUT DE TELÉFONO (Prefijo + Números)
export const PhoneInput = ({ value, onChange, name, label, required }) => {
  const safeValue = value || "0412-";
  const [prefijo, numero] = safeValue.includes("-") ? safeValue.split("-") : ["0412", ""];
  const prefijos = ["0412", "0414", "0424", "0416", "0426", "0422"];

  const triggerChange = (newPrefijo, newNumero) => {
    onChange({
      target: { name: name, value: `${newPrefijo}-${newNumero}` }
    });
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">{label}</label>
      <div className="flex shadow-sm rounded-lg">
        <div className="relative">
          <select
            value={prefijo}
            onChange={(e) => triggerChange(e.target.value, numero)}
            className="h-full rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 py-0 pl-3 pr-7 text-gray-600 font-medium focus:ring-2 focus:ring-indigo-500/20 sm:text-sm outline-none appearance-none cursor-pointer"
          >
            {prefijos.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-3 h-3 w-3 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={numero}
            required={required}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 7); // Solo numeros, max 7
              triggerChange(prefijo, val);
            }}
            placeholder="1234567"
            className="block w-full rounded-r-lg border border-gray-200 pl-10 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm outline-none"
          />
        </div>
      </div>
    </div>
  );
};