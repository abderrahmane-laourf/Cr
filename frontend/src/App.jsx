import { Routes, Route } from 'react-router-dom';
import Login from './components/login/Login';
import ForgotPassword from './components/login/forgotpassword';
import VerifyIdentity from './components/login/verifytocken';
import NewPassword from './components/login/newpassword';
import { AdminLayout } from './components/layout/layout';

// Import Pages

import EmployeesPage from './page/admin/employee';
import Paiement from './page/admin/paiement';
import AttendancePage from './page/admin/presence';


export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot_password" element={<ForgotPassword />} />
      <Route path="/verify_tocken" element={<VerifyIdentity />} />
      <Route path="/NewPassword" element={<NewPassword />} />
      
      {/* Admin Routes with Layout */}
      
      <Route path="/admin/employees" element={<AdminLayout><EmployeesPage /></AdminLayout>} />
      <Route path="/admin/paiement" element={<AdminLayout><Paiement /></AdminLayout>} />
      <Route path="/admin/presence" element={<AdminLayout><AttendancePage /></AdminLayout>} />
    </Routes>
  );
}