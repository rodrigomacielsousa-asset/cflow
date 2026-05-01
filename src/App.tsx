import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Patients from './pages/Patients';
import Team from './pages/Team';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Contact from './pages/Contact';
import FeatureDetail from './pages/FeatureDetail';
import SuperAdmin from './pages/SuperAdmin';
import PatientPortal from './pages/PatientPortal';
import ReceitaSaudeLanding from './pages/ReceitaSaudeLanding';
import ReceitaSaudeDashboard from './pages/ReceitaSaudeDashboard';
import Shell from './components/layout/Shell';
import ScrollToTop from './components/ScrollToTop';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-primary-200 rounded-xl mb-4" />
        <div className="h-4 w-32 bg-slate-200 rounded" />
      </div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/features/:slug" element={<FeatureDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/receita-saude" element={<ReceitaSaudeLanding />} />
          <Route path="/receita-saude/dashboard" element={<ReceitaSaudeDashboard />} />
          <Route path="/super-admin" element={<PrivateRoute><SuperAdmin /></PrivateRoute>} />
          <Route path="/app" element={<PrivateRoute><Shell /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="pacientes" element={<Patients />} />
            <Route path="equipe" element={<Team />} />
            <Route path="financeiro" element={<Finance />} />
            <Route path="configuracoes" element={<Settings />} />
            <Route path="portal" element={<PatientPortal />} />
            <Route path="pacientes/meus-documentos" element={<PatientPortal />} />
            {/* Fallback to Dashboard if route not found inside app */}
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
