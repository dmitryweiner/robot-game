import type { ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
}

export function Modal({ title, onClose, children, closeLabel = 'Закрыть' }: ModalProps) {
  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="modal__title">{title}</h2>
        <div className="modal__body">{children}</div>
        <button className="modal__close" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
