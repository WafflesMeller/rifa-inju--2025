// src/components/ModalRecibo.jsx
import React, { useEffect, useState } from 'react';
import { TicketCheck, MessageCircle } from 'lucide-react';
// Hook de partycles (misma forma que en tu PaymentSuccessModal)
import { useReward } from 'partycles';
import { MdWhatsapp } from "react-icons/md";


export default function ModalRecibo({ isOpen, data, onClose }) {
  const [showModal, setShowModal] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [fired, setFired] = useState(false);

  // Usamos el mismo ID que en el modal que nos funciona: "successId"
  const { reward } = useReward('successId', 'confetti', {
    particleCount: 168,
    spread: 360,
    startVelocity: 21,
    elementSize: 14,
    lifetime: 168,
    physics: {
      gravity: 0.35,
      wind: 0,
      friction: 0.98
    },
    colors: [
      "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3"
    ]
  });

  useEffect(() => {
    if (isOpen && data) {
      setShowModal(true);

      const timer = setTimeout(() => {
        setAnimate(true);

        // solo disparamos una vez por apertura (control simple con state)
        if (!fired) {
          setTimeout(() => {
            try {
              reward();
            } catch (err) {
              // no rompemos si falla partycles
              // console.warn('partycles error', err);
            }
          }, 200); // sincronizado con el "pop"
          setFired(true);
        }
      }, 10);

      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      // resetear fired para la próxima apertura
      setFired(false);
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, data, reward, fired]);

  if (!showModal || !data) return null;

  return (
    <div
      className={`
        fixed inset-0 z-110 flex items-center justify-center
        bg-neutral-900/50 backdrop-blur-sm
        transition-opacity duration-300 ease-out
        ${animate ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div
        className={`
          bg-[#1a1a1a] rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl border border-white/5
          transform transition-all duration-300 ease-out
          ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icono Grande de Ticket + ANCLA "successId" (igual que en tu modal que funciona) */}
          <div className="relative w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2 ring-1 ring-green-500/20">
            <TicketCheck size={48} strokeWidth={2.5} />

            {/* ANCLA: partycles buscará "successId" dentro del DOM (igual que tu modal) */}
            <div id="successId" className="absolute top-1/2 left-1/2 w-1 h-1" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white">¡Pago Exitoso!</h3>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Hemos procesado tu solicitud correctamente. <br />
              Los detalles de tu compra llegarán a tu
              <span className="text-green-400 font-semibold inline-flex items-center gap-1 ml-1">
                WhatsApp <MdWhatsapp size={14} />

              </span>.
            </p>
          </div>

          <div className="w-full mt-4">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full bg-green-600 hover:bg-green-500 text-white font-bold transition-all shadow-lg shadow-green-900/20 active:scale-95 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
