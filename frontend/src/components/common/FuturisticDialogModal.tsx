import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  ShieldCheck, 
  X, 
  Loader2, 
  Terminal, 
  Cpu, 
  Database, 
  Activity,
  ArrowRight
} from 'lucide-react';

export type DialogType = 'delete' | 'save' | 'warning' | 'info' | 'success';

export interface FuturisticDialogProps {
  isOpen: boolean;
  type?: DialogType;
  title: string;
  subtitle?: string;
  protocolCode?: string;
  itemBadge?: string;
  itemCode?: string;
  itemName?: string;
  impactMessage?: string;
  details?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  requireConfirmationCheck?: boolean;
  confirmationCheckLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const FuturisticDialogModal: React.FC<FuturisticDialogProps> = ({
  isOpen,
  type = 'delete',
  title,
  subtitle,
  protocolCode,
  itemBadge,
  itemCode,
  itemName,
  impactMessage,
  details,
  confirmText,
  cancelText = 'Abort Protocol',
  requireConfirmationCheck = false,
  confirmationCheckLabel = 'I authorize this critical system operation',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, isLoading, onClose]);

  if (!isOpen) return null;

  const isDelete = type === 'delete';
  const isSave = type === 'save';
  const isWarning = type === 'warning';
  const isSuccess = type === 'success';

  // Theme presets
  const theme = {
    delete: {
      border: 'border-rose-500/50',
      shadow: 'shadow-[0_0_60px_-15px_rgba(244,63,94,0.35)]',
      glowLine: 'from-transparent via-rose-500 to-transparent',
      protocolColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      iconBox: 'bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]',
      icon: <Trash2 className="w-6 h-6 animate-pulse" />,
      btnConfirm: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/40 border border-rose-400/40',
      codeBox: 'border-rose-500/30 bg-rose-950/30 text-rose-300',
      defaultTitle: 'Confirm Decommission Execution',
      defaultConfirmText: 'Execute Decommission',
      defaultProtocol: 'SEC_AUDIT // DECOMMISSION_PROTOCOL_L3'
    },
    save: {
      border: 'border-cyan-500/50',
      shadow: 'shadow-[0_0_60px_-15px_rgba(6,182,212,0.35)]',
      glowLine: 'from-transparent via-cyan-400 to-transparent',
      protocolColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      iconBox: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
      icon: <Save className="w-6 h-6 animate-pulse" />,
      btnConfirm: 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-lg shadow-cyan-500/40 border border-cyan-400/40',
      codeBox: 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300',
      defaultTitle: 'Verify & Commit Configuration',
      defaultConfirmText: 'Commit Changes',
      defaultProtocol: 'SYS_COMMIT // TRANSACTION_VERIFY_V1'
    },
    warning: {
      border: 'border-amber-500/50',
      shadow: 'shadow-[0_0_60px_-15px_rgba(245,158,11,0.35)]',
      glowLine: 'from-transparent via-amber-400 to-transparent',
      protocolColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      iconBox: 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
      icon: <AlertTriangle className="w-6 h-6 animate-bounce" />,
      btnConfirm: 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-lg shadow-amber-600/40 border border-amber-400/40',
      codeBox: 'border-amber-500/30 bg-amber-950/30 text-amber-300',
      defaultTitle: 'System Warning Notice',
      defaultConfirmText: 'Proceed With Action',
      defaultProtocol: 'NET_WARN // SYSTEM_OVERRIDE_GUARD'
    },
    info: {
      border: 'border-blue-500/50',
      shadow: 'shadow-[0_0_60px_-15px_rgba(59,130,246,0.35)]',
      glowLine: 'from-transparent via-blue-400 to-transparent',
      protocolColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      iconBox: 'bg-blue-500/15 border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      icon: <Info className="w-6 h-6" />,
      btnConfirm: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/40 border border-blue-400/40',
      codeBox: 'border-blue-500/30 bg-blue-950/30 text-blue-300',
      defaultTitle: 'Operational Telemetry Notice',
      defaultConfirmText: 'Acknowledge',
      defaultProtocol: 'OSS_CORE // TELEMETRY_DISPATCH'
    },
    success: {
      border: 'border-emerald-500/50',
      shadow: 'shadow-[0_0_60px_-15px_rgba(16,185,129,0.35)]',
      glowLine: 'from-transparent via-emerald-400 to-transparent',
      protocolColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      iconBox: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
      icon: <CheckCircle2 className="w-6 h-6" />,
      btnConfirm: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/40 border border-emerald-400/40',
      codeBox: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300',
      defaultTitle: 'Transaction Executed Successfully',
      defaultConfirmText: 'Dismiss',
      defaultProtocol: 'TRANSACTION // OK_STATE_200'
    }
  }[type];

  const handleExecute = async () => {
    if (requireConfirmationCheck && !isChecked) return;
    setSubmitting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Dialog action execution error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || isLoading;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Dark Cyber Backdrop with Blur */}
      <div 
        className="fixed inset-0 bg-[#050811]/85 backdrop-blur-xl transition-opacity cursor-pointer"
        onClick={() => !isBusy && onClose()}
      />

      {/* Futuristic Dialog Box */}
      <div 
        className={`relative z-10 w-full max-w-lg bg-[#090d16]/95 rounded-3xl p-6 sm:p-7 border ${theme.border} ${theme.shadow} backdrop-blur-2xl animate-in zoom-in-95 duration-200 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Ambient Glow Laser Line */}
        <div className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${theme.glowLine} animate-pulse`} />

        {/* Futuristic Corner Tech Accents */}
        <div className="absolute top-2.5 left-3 text-[10px] font-mono text-slate-600 select-none">┌ [SYS]</div>
        <div className="absolute top-2.5 right-10 text-[10px] font-mono text-slate-600 select-none">[NETSTREAM] ┐</div>
        <div className="absolute bottom-2.5 left-3 text-[10px] font-mono text-slate-600 select-none">└ [SEC-OPS]</div>
        <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-600 select-none">[v1.0] ┘</div>

        {/* Header Section */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800/80 mt-1">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Glowing Icon Container */}
            <div className={`p-3 rounded-2xl border ${theme.iconBox} shrink-0 mt-0.5`}>
              {theme.icon}
            </div>

            <div className="min-w-0 space-y-1">
              {/* Protocol Identifier */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${theme.protocolColor}`}>
                  {protocolCode || theme.defaultProtocol}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide truncate">
                {title || theme.defaultTitle}
              </h3>
              
              {subtitle && (
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-40 shrink-0"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Target HUD */}
        <div className="py-4 space-y-3.5">
          {/* Item Target Display (if provided) */}
          {(itemCode || itemName) && (
            <div className={`p-3.5 rounded-2xl border ${theme.codeBox} space-y-1.5`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  Target Identifier
                </span>
                {itemBadge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700 font-bold">
                    {itemBadge}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wide break-all">
                  {itemCode}
                </span>
                {itemName && (
                  <span className="text-xs text-slate-400 truncate">
                    ({itemName})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Impact Warning / Advisory Message */}
          {impactMessage && (
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                {isDelete && <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />}
                {isSave && <Activity className="w-4 h-4 text-cyan-400 shrink-0" />}
                {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                <span>Operational Impact Assessment:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans pl-6">
                {impactMessage}
              </p>
            </div>
          )}

          {/* Custom Details Component (if any) */}
          {details && (
            <div className="text-xs text-slate-300 space-y-2">
              {details}
            </div>
          )}

          {/* Confirmation Checkbox Guard (Optional) */}
          {requireConfirmationCheck && (
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors group">
              <input 
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                disabled={isBusy}
                className="mt-0.5 w-4 h-4 rounded bg-slate-950 border-slate-700 text-rose-500 focus:ring-rose-500/50 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors">
                {confirmationCheckLabel}
              </span>
            </label>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isBusy || (requireConfirmationCheck && !isChecked)}
            onClick={handleExecute}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${theme.btnConfirm}`}
          >
            {isBusy ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Protocol...</span>
              </>
            ) : (
              <>
                {isDelete && <Trash2 className="w-3.5 h-3.5" />}
                {isSave && <Save className="w-3.5 h-3.5" />}
                {isWarning && <ArrowRight className="w-3.5 h-3.5" />}
                {isSuccess && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{confirmText || theme.defaultConfirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
