import React, { useEffect } from 'react';
import './Modal.css';

export default function Modal({ isOpen, onClose, children }) {
  // Close on Esc key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-accent-bar" />
        <div className="modal-body">
          {children}
        </div>
        <button className="modal-close-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
