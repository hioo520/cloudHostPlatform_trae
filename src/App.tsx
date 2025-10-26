import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomLayout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HostManagement from './pages/HostManagement';
import InefficientHostPage from './pages/InefficientHostPage';
import PublicPoolPage from './pages/PublicPoolPage';
import MetricsPage from './pages/MetricsPage';
import ChangeManagement from './pages/ChangeManagement';
import './App.css';

function App() {
  return (
    <Router>
      <CustomLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/host-management" element={<HostManagement />} />
          <Route path="/inefficient-hosts" element={<InefficientHostPage />} />
          <Route path="/public-pool" element={<PublicPoolPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/change-management" element={<ChangeManagement />} />
        </Routes>
      </CustomLayout>
    </Router>
  );
}

export default App;
