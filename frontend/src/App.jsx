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
import EmployeeDashboard from './page/admin/employeeDashboard';
import StockListPage from './page/admin/stock';
import StockMovementsPage from './page/admin/stockMovements';
import StockTransferPage from './page/admin/stockTransfer';
import StockDashboard from './page/admin/stockDashboard';


export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot_password" element={<ForgotPassword />} />
      <Route path="/verify_tocken" element={<VerifyIdentity />} />
      <Route path="/NewPassword" element={<NewPassword />} />
      
      {/* Admin Routes with Layout */}
      {/* Employee Management Routes */}
      <Route path="/admin/employees/dashboard" element={<AdminLayout><EmployeeDashboard /></AdminLayout>} />
      <Route path="/admin/employees" element={<AdminLayout><EmployeesPage /></AdminLayout>} />
      <Route path="/admin/paiement" element={<AdminLayout><Paiement /></AdminLayout>} />
      <Route path="/admin/presence" element={<AdminLayout><AttendancePage /></AdminLayout>} />
      
      {/* Stock Management Routes */}
      <Route path="/admin/stock/dashboard" element={<AdminLayout><StockDashboard /></AdminLayout>} />
      <Route path="/admin/stock" element={<AdminLayout><StockListPage /></AdminLayout>} />
      <Route path="/admin/stock/movements" element={<AdminLayout><StockMovementsPage /></AdminLayout>} />
      <Route path="/admin/stock/transfer" element={<AdminLayout><StockTransferPage /></AdminLayout>} />
    </Routes>
  );
}