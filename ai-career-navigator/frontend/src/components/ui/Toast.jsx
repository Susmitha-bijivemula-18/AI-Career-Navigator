import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconInfoCircle, IconX } from '@tabler/icons-react';

export default function Toast({ message, duration = 5000, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const enterTimer = setTimeout(() => setVisible(true), 10);
    
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for transition before unmounting
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration, onClose]);

  return createPortal(
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50 max-w-[90vw] md:max-w-md w-max">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
          <IconInfoCircle className="w-5 h-5 text-indigo-400" />
        </div>
        <p className="text-sm font-medium leading-tight">
          {message}
        </p>
        <button onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }} className="ml-2 p-1 text-slate-400 hover:text-white transition-colors">
          <IconX className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
