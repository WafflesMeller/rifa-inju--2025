// src/components/BottomSheetConfirm.jsx
import React from 'react';
import { Sheet } from 'react-modal-sheet';
import { X, CheckCircle } from 'lucide-react';
import CheckoutPage from '../page/CheckoutPage';

/**
 * BottomSheetConfirm - versión mejorada visualmente
 *
 * - Header compacto con gradiente y handle sutil
 * - Card blanca centrada que contiene CheckoutPage con paddings razonables
 * - Backdrop con blur y opacidad
 * - Footer con CTA discreto (no dispara submit, solo ayuda visual)
 */
const BottomSheetConfirm = ({ isOpen, onClose, selectedTickets = [], totalAmount = 0, onClear = () => {} }) => {
  const handleSuccess = (result) => {
    try {
      if (typeof onClear === 'function') onClear();
    } catch {}
    onClose?.();
    console.log('Pago confirmado:', result);
  };

  const ticketsLabel = selectedTickets.length > 0 ? selectedTickets.join(', ') : '—';

  return (
    <Sheet isOpen={Boolean(isOpen)} onClose={onClose}>
      <Sheet.Container
        className="rounded-t-2xl!"
        style={{
          background: 'linear-gradient(90deg,#0f172a 0%, #1e293b 50%, #312e81 100%)',
        }}
      >
        <Sheet.Header>
          {/* Header: gradient + small handle */}
          <div className=" px-4 pt-3 pb-2">
            <div className="flex flex-col items-center">
              <div className="w-12 h-1.5 bg-white/25 rounded-full mb-3" />

              <div className="w-full flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-white leading-tight">
                    Confirmar y Reportar Pago
                  </h3>
                  <p className="text-sm text-white/80 mt-0.5">Completa los datos para validar tu pago</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-3">
                    <MiniChip label={`${selectedTickets.length}`} sub="Boletos" />
                    <MiniChip label={`$${totalAmount}`} sub="Total" color="bg-yellow-400 text-yellow-900" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Sheet.Header>

        <Sheet.Content>
          <div className="w-full max-w-4xl mx-auto">
            {/* Main white card with subtle shadow, centered */}
            <div className="bg-white rounded-b-2xl -mt-4 shadow-2xl overflow-hidden">
              <div className="px-6 py-6 md:px-8 md:py-8">
                {/* small top summary for mobile */}
                <div className="sm:hidden mb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Boletos</div>
                      <div className="font-semibold text-gray-900">{selectedTickets.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="font-semibold text-gray-900">${totalAmount}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Números</div>
                      <div className="text-sm text-gray-700 truncate" style={{ maxWidth: 120 }}>
                        {ticketsLabel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* The actual form is placed inside a centered card container for better composition */}
                <div className="mx-auto max-w-2xl">
                  <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 md:p-6">
                    <CheckoutPage
                      selectedTickets={selectedTickets}
                      totalAmount={totalAmount}
                      onBack={onClose}
                      onSuccess={handleSuccess}
                    />
                  </div>

                  {/* Footer actions */}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          // no-op: preferir que usuario envíe desde el formulario
                          // si quieres, podemos exponer un submitRef desde CheckoutPage
                        }}
                        className="px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                      >
                        <CheckCircle className="inline w-4 h-4 mr-2" />
                        Reportar Pago
                      </button>
                    </div>
                  </div>
                </div>
                {/* end centered container */}
              </div>
            </div>
            {/* end white card */}
          </div>
        </Sheet.Content>
      </Sheet.Container>

      <Sheet.Backdrop className="backdrop-blur-sm bg-black/40" />
    </Sheet>
  );
};

const MiniChip = ({ label, sub, color = 'bg-white text-gray-900' }) => (
  <div
    className={`flex flex-col items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${color}`}
    style={{ minWidth: 56 }}
  >
    <div className="text-sm leading-none">{label}</div>
    <div className="text-xs leading-none text-white/80 mt-0.5">{sub}</div>
  </div>
);

export default BottomSheetConfirm;
