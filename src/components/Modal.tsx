import { Fragment, type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './UI';
import { X, CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      overlayRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return createPortal(
    <Fragment>
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 transition-opacity duration-200 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className={`${sizes[size]} w-full glass-modal rounded-2xl shadow-2xl border border-slate-700/80 my-8 overflow-hidden transform transition-all animate-scale-up`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
            <h2 id="modal-title" className="text-lg font-bold text-slate-100 tracking-tight">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </Fragment>,
    document.body
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return createPortal(
    <Fragment>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-modal rounded-2xl border border-slate-700/80 shadow-2xl p-6">
          <div className="flex items-center gap-3 text-rose-400 mb-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          </div>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">{message}</p>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button variant={variant} size="sm" onClick={onConfirm} isLoading={isLoading}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Fragment>,
    document.body
  );
}

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-indigo-400" />,
  };

  const borderStyle = {
    success: 'border-emerald-500/30 bg-slate-900/95 text-emerald-300',
    error: 'border-rose-500/30 bg-slate-900/95 text-rose-300',
    info: 'border-indigo-500/30 bg-slate-900/95 text-indigo-300',
  };

  return (
    <div
      className={`glass-card border px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm border-slate-700 ${borderStyle[type]}`}
      role="alert"
    >
      {icons[type]}
      <p className="text-xs font-semibold text-slate-100 flex-1">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToasterProps {
  toasts: { id: string; message: string; type?: 'success' | 'error' | 'info' }[];
  onClose: (id: string) => void;
}

export function Toaster({ toasts, onClose }: ToasterProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast message={toast.message} type={toast.type} onClose={() => onClose(toast.id)} />
        </div>
      ))}
    </div>
  );
}