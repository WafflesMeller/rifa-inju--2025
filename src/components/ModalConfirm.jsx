// src/components/ModalConfirm.jsx
import React, { Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X } from "lucide-react";
import CheckoutPage from "../page/CheckoutPage";

export default function ModalConfirm({ 
  isOpen, 
  onClose, 
  selectedTickets = [], 
  totalAmount = 0, 
  onClear = () => {} 
}) {
  return (
    <Transition show={Boolean(isOpen)} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        {/* Container principal */}
        <div className="fixed inset-0 z-10 w-screen overflow-hidden">
          <div className="flex h-full min-h-full items-end justify-center p-0 text-center sm:items-center sm:p-4">
            
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
                  bg-gray-50 text-left shadow-lg transition-all
                  w-full max-w-5xl
                  
                  /* 🔥🔥 CAMBIO 1: Altura y Bordes para Escritorio */
                  h-full                 /* Móvil: Pantalla completa */
                  sm:h-auto              /* Escritorio: Auto... */
                  sm:max-h-[95vh]        /* ...pero con límite para forzar scroll interno */
                  
                  rounded-none           /* Móvil: Cuadrado */
                  sm:rounded-xl         /* Escritorio: Borde muy redondeado */
                  
                  flex flex-col          /* Estructura vertical (Header - Body - Footer) */
                "
              >
                {/* 1. HEADER (Fijo) */}
                <div
                  className="flex-none px-5 py-2"
                  style={{
                    background: "linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)",
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <DialogTitle as="h3" className="text-lg font-bold text-white">
                        Confirmar y Reportar Pago
                      </DialogTitle>
                      <p className="text-sm text-white/80 mt-1">Completa los datos para validar tu pago</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. BODY (Scrollable) */}
                {/* 🔥🔥 CAMBIO 2: overflow-y-auto (AQUÍ ESTABA EL ERROR) */}
                {/* Quitamos 'overflow-hidden' y ponemos 'overflow-y-auto' para que ESTA zona haga scroll */}
                <div className="bg-white flex-1 overflow-y-auto relative">
                  <div className="mx-auto w-full h-full sm:p- sm:pb-4">
                    <CheckoutPage
                      selectedTickets={selectedTickets}
                      totalAmount={totalAmount}
                      onBack={onClose}
                      onSuccess={(result) => {
                        try {
                          if (typeof onClear === "function") onClear();
                        } catch (e) { console.error(e) }
                        onClose();
                        console.log("Pago confirmado:", result);
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