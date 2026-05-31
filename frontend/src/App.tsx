import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/home/HomePage';
import PatientsPage from './pages/patients/PatientsPage';
import PatientExaminationsPage from './pages/patient-examinations/PatientExaminationsPage';
import PaymentRequestsPage from './pages/payment-requests/PaymentRequestsPage';
import CampagnePage from './pages/campagne/CampagnePage';
import ReglagesPage from './pages/settings/ReglagesPage';
import FlowEditorPage from './pages/flows/FlowEditorPage';
import FlowsPage from './pages/flows/FlowsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="visites" element={<PatientExaminationsPage />} />
        <Route path="relances" element={<PaymentRequestsPage />} />
        <Route path="campagne" element={<CampagnePage />} />
        <Route path="reglages" element={<ReglagesPage />} />
        <Route path="flows" element={<FlowsPage />} />
        <Route path="flows/:flowId" element={<FlowEditorPage />} />
        {/* Redirects pour les anciennes URLs */}
        <Route path="patient-examinations" element={<Navigate to="/visites" replace />} />
        <Route path="payment-requests" element={<Navigate to="/relances" replace />} />
        <Route path="examinations" element={<Navigate to="/reglages" replace />} />
      </Route>
    </Routes>
  );
}
