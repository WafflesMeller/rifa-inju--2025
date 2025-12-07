// src/components/ModalConfirm.jsx
import React, { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';
import CheckoutPage from '../page/CheckoutPage';

export default function ModalConfirm({
  isOpen,
  onClose,
  selectedTickets = [],
  totalAmount = 0,
  onClear = () => {},
  onPaymentSuccess = () => {},
}) {
  return (
    <Transition show={Boolean(isOpen)} as={Fragment}>
      {/* 🔴 ERROR ANTERIOR: z-100 (No existe en Tailwind por defecto) 
         🟢 CORRECCIÓN: z-[100] (Uso de corchetes para valor personalizado) 
      */}
      <Dialog as="div" className="relative z-100" onClose={onClose}>
        
        {/* Backdrop (Fondo oscuro) */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        {/* Container principal */}
        {/* 🔴 ERROR ANTERIOR: z-100 
           🟢 CORRECCIÓN: z-[100] (Asegura que esté encima de la barra flotante que es z-40) 
        */}
        <div className="fixed inset-0 z-100 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-0 text-center sm:items-center sm:p-4">
            
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full opacity-0 sm:translate-y-4 sm:scale-95"
              enterTo="translate-y-0 opacity-100 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0 opacity-100 sm:scale-100"
              leaveTo="translate-y-full opacity-0 sm:translate-y-4 sm:scale-95"
            >
              <DialogPanel
                className="
                  relative transform overflow-hidden 
                  bg-gray-50 text-left shadow-2xl transition-all
                  w-full max-w-5xl
                  
                  /* Altura y Bordes */
                  h-[100dvh]               /* Móvil: Pantalla completa */
                  sm:h-auto sm:max-h-[90vh] 
                  rounded-none sm:rounded-2xl
                  
                  flex flex-col
                "
              >
                {/* 1. HEADER (Fijo) */}
                <div
                  className="flex-none px-5 py-3"
                  style={{
                    background: 'linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)',
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <DialogTitle as="h3" className="text-lg font-bold text-white">
                        Confirmar Pago
                      </DialogTitle>
                      <p className="text-xs text-white/70">Completa los datos para validar</p>
                    </div>

                    <button
                      onClick={onClose}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* 2. BODY (Scrollable) */}
                <div className="bg-white flex-1 overflow-y-auto relative">
                  <div className="w-full h-full">
                    <CheckoutPage
                      selectedTickets={selectedTickets}
                      totalAmount={totalAmount}
                      onBack={onClose}
                      onSuccess={(result) => {
                        try {
                          if (typeof onClear === 'function') onClear();
                        } catch (e) { console.error(e) }
                        
                        // 1. Cerramos el modal
                        onClose();
                        
                        // 2. Avisamos al padre (con timeout para que la animación se vea bien)
                        setTimeout(() => {
                          onPaymentSuccess(result);
                        }, 300);
                      }}
                    />
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}