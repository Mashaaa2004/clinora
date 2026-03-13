import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthPage } from './AuthPage';
import { Layout } from './components/Layout';
import { AdminDashboard } from './components/AdminDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { PatientDashboard } from './components/PatientDashboard';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {user?.role === 'admin' && <AdminDashboard />}
      {user?.role === 'doctor' && <DoctorDashboard />}
      {user?.role === 'patient' && <PatientDashboard activeTab={activeTab} />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
