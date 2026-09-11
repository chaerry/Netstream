import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { DialogProvider } from './components/common/DialogContext';
import { AppLayout } from './components/layout/AppLayout';
import { InventoryModulePage } from './pages/InventoryModulePage';
import { GisModulePage } from './pages/GisModulePage';
import { IpManagementPage } from './pages/IpManagementPage';
import { TelephoneNumberPage } from './pages/TelephoneNumberPage';
import { PlaceholderModulePage } from './pages/PlaceholderModulePage';
import { LoginPage } from './pages/LoginPage';

const AppRoutes: React.FC = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/inventory" replace />} />
          <Route path="inventory" element={<InventoryModulePage />} />
          <Route path="gis" element={<GisModulePage />} />
          <Route path="ipam" element={<IpManagementPage />} />
          <Route path="telephony" element={<TelephoneNumberPage />} />
          <Route path="placeholder/:moduleId" element={<PlaceholderModulePage />} />
          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DialogProvider>
        <AppRoutes />
      </DialogProvider>
    </AuthProvider>
  );
};

export default App;
