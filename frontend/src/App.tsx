import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ExaminationsPage from './pages/examinations/ExaminationsPage';
import PatientExaminationsPage from './pages/patient-examinations/PatientExaminationsPage';
import PatientsPage from './pages/patients/PatientsPage';
import PaymentRequestsPage from './pages/payment-requests/PaymentRequestsPage';
import FlowEditorPage from './pages/flows/FlowEditorPage';
import FlowsPage from './pages/flows/FlowsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/patients" replace />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="examinations" element={<ExaminationsPage />} />
        <Route path="patient-examinations" element={<PatientExaminationsPage />} />
        <Route path="payment-requests" element={<PaymentRequestsPage />} />
        <Route path="flows" element={<FlowsPage />} />
        <Route path="flows/:flowId" element={<FlowEditorPage />} />
      </Route>
    </Routes>
  );
}
