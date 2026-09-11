import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl w-full',
    '5xl': 'max-w-5xl w-full',
    '6xl': 'max-w-6xl w-[92vw] lg:w-[85vw]',
    '7xl': 'max-w-7xl w-[94vw] lg:w-[90vw]',
    full: 'w-[95vw] max-w-[1440px]',
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full ${maxWidthClasses[maxWidth]} bg-[#090d16]/95 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-[0_0_50px_-15px_rgba(6,182,212,0.25)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Ambient Cyber Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Futuristic Corner Tech Accents */}
        <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-600 select-none pointer-events-none">┌ [SYS-MODAL]</div>
        <div className="absolute top-2 right-12 text-[9px] font-mono text-slate-600 select-none pointer-events-none">[NETSTREAM] ┐</div>

        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-5 border-b border-slate-800/80 relative">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-cyan-400 shadow-sm shadow-cyan-500/10">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[75vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};
