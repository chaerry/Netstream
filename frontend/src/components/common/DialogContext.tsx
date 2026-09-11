import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { FuturisticDialogModal, DialogType } from './FuturisticDialogModal';

export interface ConfirmDeleteOptions {
  title?: string;
  subtitle?: string;
  protocolCode?: string;
  itemBadge?: string;
  itemCode: string;
  itemName?: string;
  impactMessage?: string;
  details?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  requireConfirmationCheck?: boolean;
  confirmationCheckLabel?: string;
}

export interface ConfirmSaveOptions {
  title?: string;
  subtitle?: string;
  protocolCode?: string;
  itemBadge?: string;
  itemCode?: string;
  itemName?: string;
  impactMessage?: string;
  details?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export interface ConfirmActionOptions {
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
}

export interface AlertOptions {
  type?: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  subtitle?: string;
  protocolCode?: string;
  message: string;
  buttonText?: string;
}

interface DialogState extends ConfirmActionOptions {
  isOpen: boolean;
}

interface DialogContextType {
  confirmDelete: (options: ConfirmDeleteOptions) => Promise<boolean>;
  confirmSave: (options: ConfirmSaveOptions) => Promise<boolean>;
  confirmAction: (options: ConfirmActionOptions) => Promise<boolean>;
  showAlert: (options: AlertOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    type: 'delete',
    title: '',
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirmAction = useCallback((options: ConfirmActionOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        ...options,
        isOpen: true,
      });
    });
  }, []);

  const confirmDelete = useCallback((options: ConfirmDeleteOptions): Promise<boolean> => {
    return confirmAction({
      type: 'delete',
      title: options.title || 'Confirm Decommission Protocol',
      subtitle: options.subtitle || 'Asset Retirement Verification',
      protocolCode: options.protocolCode || 'SEC_OPS // PURGE_VERIFY_L3',
      itemBadge: options.itemBadge || 'CRITICAL_ASSET',
      confirmText: options.confirmText || 'Execute Decommission',
      cancelText: options.cancelText || 'Abort Protocol',
      ...options,
    });
  }, [confirmAction]);

  const confirmSave = useCallback((options: ConfirmSaveOptions): Promise<boolean> => {
    return confirmAction({
      type: 'save',
      title: options.title || 'Verify & Commit Configuration',
      subtitle: options.subtitle || 'Production Transaction Verification',
      protocolCode: options.protocolCode || 'SYS_COMMIT // WRITE_VERIFY_V1',
      confirmText: options.confirmText || 'Commit Changes',
      cancelText: options.cancelText || 'Cancel / Edit Further',
      ...options,
    });
  }, [confirmAction]);

  const showAlert = useCallback((options: AlertOptions): Promise<void> => {
    const dialogType: DialogType = options.type === 'danger' ? 'delete' : (options.type || 'info');
    return new Promise((resolve) => {
      resolverRef.current = () => resolve();
      setDialogState({
        type: dialogType,
        title: options.title,
        subtitle: options.subtitle,
        protocolCode: options.protocolCode || 'OSS_TELEMETRY // DISPATCH',
        impactMessage: options.message,
        confirmText: options.buttonText || 'Acknowledge',
        cancelText: 'Dismiss',
        isOpen: true,
      });
    });
  }, []);

  const handleConfirm = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleClose = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  return (
    <DialogContext.Provider value={{ confirmDelete, confirmSave, confirmAction, showAlert }}>
      {children}
      <FuturisticDialogModal
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        subtitle={dialogState.subtitle}
        protocolCode={dialogState.protocolCode}
        itemBadge={dialogState.itemBadge}
        itemCode={dialogState.itemCode}
        itemName={dialogState.itemName}
        impactMessage={dialogState.impactMessage}
        details={dialogState.details}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        requireConfirmationCheck={dialogState.requireConfirmationCheck}
        confirmationCheckLabel={dialogState.confirmationCheckLabel}
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
