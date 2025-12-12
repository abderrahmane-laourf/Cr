import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import ForgotPassword from './components/login/forgotpassword';
import VerifyIdentity from './components/login/verifytocken';
import NewPassword from './components/login/newpassword';
import { AdminLayout } from './components/layout/layout';

// Import Pages
import EmployeesPage from './page/admin/employee';
import BusinessPage from './page/admin/business';
import Paiement from './page/admin/paiement';
import AttendancePage from './page/admin/presence';
import EmployeeDashboard from './page/admin/employeeDashboard';
import GlobalDashboard from './page/admin/globalDashboard';
import StockListPage from './page/admin/stock';
import StockMovementsPage from './page/admin/stockMovements';
import StockTransferPage from './page/admin/stockTransfer';
import StockDashboard from './page/admin/stockDashboard';
import ProductsPage from './page/admin/products';
import ProductDashboard from './page/admin/productDashboard';
import KanbanBoard from './page/admin/managementpipeline'; 
import PipelineDashboard from './page/admin/pipelineDash';
import ListPipeline from './page/admin/listpipeline';
import ProductionPage from './page/admin/production';
import ProductionDashboard from './page/admin/productionDashboard';
import LossesPage from './page/admin/losses';
import AdsPage from './page/admin/ads';
import AdsDashboard from './page/admin/adsDashboard';
import AssetsPage from './page/admin/actifs';
import AssetsDashboard from './page/admin/assetsDashboard';
import DebtsPage from './page/admin/debts';
import DebtsDashboard from './page/admin/debtsDashboard';
import PetiteCaissePage from './page/admin/petitecaisse';
import PetiteCaisseDashboard from './page/admin/petitecaisseDashboard';
import ReportsPage from './page/admin/rapports';
import TaskManager from './page/admin/listtask';
import ChallengesPage from './page/admin/challenges';
import ComingSoon from './components/comingSoon';
import SettingsPage from './page/admin/settings';
import AffectationsPage from './page/admin/affectations';
import PermissionsPage from './page/admin/permissions';
import CommissionsPage from './page/admin/commissions';
import LogsPage from './page/admin/log';
import SoldPage from './page/admin/sold';
import HistoriquePaiementLivraison from './page/admin/historiquepaiementlivraison';
import PipelineAgadir from './page/admin/pipelineAgadir';
import TrackingLivreur from './page/admin/trackingLivreur';
import Retourner from './page/admin/retourner';
import SettlementManagement from './page/admin/settlementManagement';
import InvestmentManagement from './page/admin/investissement';

// Employee Pages
import { EmployeeLayout } from './components/layout/employeeLayout';
import ConfirmationDashboard from './page/employee/confirmation/dashboard'; 
import ConfirmationClients from './page/employee/confirmation/clients';
import ConfirmationClientsAgadir from './page/employee/confirmation/clientsAgadir';
import ConfirmationRetourner from './page/employee/confirmation/retourner';
import Leaderboard from './page/employee/confirmation/leaderboard';
import ConfirmationManagerInvestment from './page/employee/confirmation/investissement';
import VersementEmployeeManager from './page/employee/confirmation/versementemployeemanager';
import PackagingQueue from './page/employee/packaging/queue';
import PackagingDashboard from './page/employee/packaging/dashboard';
import EmployeeTaskPage from './page/employee/tasks';
import DeliveryDashboard from './page/employee/delivery/dashboard';
import DeliveryRunPage from './page/employee/delivery/run';
import GlobalDispatchPage from './page/employee/delivery/manager_dispatch';
import Portefeuille from './page/employee/delivery/portefeuille';
import ManagerApprovals from './page/employee/delivery/manager_approvals';
import AdminApprovals from './page/admin/adminApprovals';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot_password" element={<ForgotPassword />} />
      <Route path="/verify_tocken" element={<VerifyIdentity />} />
      <Route path="/NewPassword" element={<NewPassword />} />
      
      {/* Admin Redirect - automatically go to employees page */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Admin Routes with Layout */}
      {/* Employee Management Routes */}
      <Route path="/admin/dashboard" element={<AdminLayout><GlobalDashboard /></AdminLayout>} />
      <Route path="/admin/employees" element={<AdminLayout><EmployeesPage /></AdminLayout>} />
      <Route path="/admin/employees/dashboard" element={<AdminLayout><EmployeeDashboard /></AdminLayout>} />
      <Route path="/admin/business" element={<AdminLayout><BusinessPage /></AdminLayout>} />
      <Route path="/admin/settings" element={<AdminLayout><SettingsPage /></AdminLayout>} />
      <Route path="/admin/historiquepaiementlivraison" element={<AdminLayout><HistoriquePaiementLivraison /></AdminLayout>} />
      <Route path="/admin/pipelineagadir" element={<AdminLayout><PipelineAgadir /></AdminLayout>} />
      <Route path="/admin/paiement" element={<AdminLayout><Paiement /></AdminLayout>} />
      <Route path="/admin/presence" element={<AdminLayout><AttendancePage /></AdminLayout>} />
      <Route path="/admin/affectations" element={<AdminLayout><AffectationsPage /></AdminLayout>} />
      <Route path="/admin/permissions" element={<AdminLayout><PermissionsPage /></AdminLayout>} />
      <Route path="/admin/commissions" element={<AdminLayout><CommissionsPage /></AdminLayout>} />
      
      
      {/* Stock Management Routes */}
      <Route path="/admin/stock/dashboard" element={<AdminLayout><StockDashboard /></AdminLayout>} />
      <Route path="/admin/stock" element={<AdminLayout><StockListPage /></AdminLayout>} />
      <Route path="/admin/stock/movements" element={<AdminLayout><StockMovementsPage /></AdminLayout>} />
      <Route path="/admin/stock/transfer" element={<AdminLayout><StockTransferPage /></AdminLayout>} />
      <Route path="/admin/losses" element={<AdminLayout><LossesPage /></AdminLayout>} />
      
      {/* Product Management Routes */}
      <Route path="/admin/products/dashboard" element={<AdminLayout><ProductDashboard /></AdminLayout>} />
      <Route path="/admin/products" element={<AdminLayout><ProductsPage /></AdminLayout>} />

      {/* Production Management Routes */}
      <Route path="/admin/production/dashboard" element={<AdminLayout><ProductionDashboard /></AdminLayout>} />
      <Route path="/admin/production" element={<AdminLayout><ProductionPage /></AdminLayout>} />

      {/* Achats/Purchases Routes - Coming Soon */}
      <Route path="/admin/bon-achat" element={<AdminLayout><ComingSoon title="Bons d'Achat" message="La gestion des bons d'achat sera bientôt disponible." /></AdminLayout>} />
      <Route path="/admin/suppliers" element={<AdminLayout><ComingSoon title="Fournisseurs" message="La gestion des fournisseurs sera bientôt disponible." /></AdminLayout>} />

      {/* Pipeline Management Routes */}
      <Route path="/admin/pipeline" element={<AdminLayout><KanbanBoard /></AdminLayout>} />
      <Route path="/admin/pipeline/dashboard" element={<AdminLayout><PipelineDashboard /></AdminLayout>} />
      <Route path="/admin/pipeline/list" element={<AdminLayout><ListPipeline /></AdminLayout>} />
      <Route path="/admin/retourner" element={<AdminLayout><Retourner /></AdminLayout>} />
      <Route path="/admin/tracking-livreur" element={<AdminLayout><TrackingLivreur /></AdminLayout>} />
      <Route path="/admin/approvals" element={<AdminLayout><AdminApprovals /></AdminLayout>} />
      <Route path="/admin/settlements" element={<AdminLayout><SettlementManagement /></AdminLayout>} />
      <Route path="/admin/investissement" element={<AdminLayout><InvestmentManagement /></AdminLayout>} />

      {/* lose page */}
      <Route path='/admin/pertes' element={<AdminLayout><LossesPage /></AdminLayout>} />

      {/* Ads Management Routes */}
      <Route path="/admin/ads/dashboard" element={<AdminLayout><AdsDashboard /></AdminLayout>} />
      <Route path="/admin/ads" element={<AdminLayout><AdsPage /></AdminLayout>} />
      <Route path="/admin/task" element={<AdminLayout><TaskManager /></AdminLayout>} />
      <Route path="/admin/task/dashboard" element={<AdminLayout><ComingSoon title="Task Dashboard" message="Le tableau de bord des tâches sera bientôt disponible." /></AdminLayout>} />
      
      {/* Assets Management Routes */}
      <Route path="/admin/actifs/dashboard" element={<AdminLayout><AssetsDashboard /></AdminLayout>} />
      <Route path="/admin/actifs" element={<AdminLayout><AssetsPage /></AdminLayout>} />

      {/* Debts Management Routes */}
      <Route path="/admin/debts" element={<AdminLayout><DebtsPage /></AdminLayout>} />
      <Route path="/admin/debts/dashboard" element={<AdminLayout><DebtsDashboard /></AdminLayout>} />
      {/* Petite Caisse Routes */}
      <Route path="/admin/petitecaisse/dashboard" element={<AdminLayout><PetiteCaisseDashboard /></AdminLayout>} />
      <Route path="/admin/petitecaisse" element={<AdminLayout><PetiteCaissePage defaultTab="espece" /></AdminLayout>} />
      <Route path="/admin/petitecaisse/espece" element={<AdminLayout><PetiteCaissePage defaultTab="espece" /></AdminLayout>} />
      <Route path="/admin/petitecaisse/virement" element={<AdminLayout><PetiteCaissePage defaultTab="virement" /></AdminLayout>} />

      {/* Reports Routes */}
      <Route path="/admin/rapports" element={<AdminLayout><ReportsPage /></AdminLayout>} />
      <Route path="/admin/rapport" element={<AdminLayout><ReportsPage /></AdminLayout>} /> {/* Fallback route */}

      {/* Challenges Routes */}
      <Route path="/admin/challenges" element={<AdminLayout><ChallengesPage /></AdminLayout>} />

      {/* Sold / US Dollar Management */}
      <Route path="/admin/sold" element={<AdminLayout><SoldPage /></AdminLayout>} />

      {/* Employee Routes (With Layout) */}
      <Route path="/employee" element={<Navigate to="/employee/confirmation/dashboard" replace />} />
      
      {/* Convenience Routes for Employee Access */}
      <Route path="/packaging" element={<Navigate to="/employee/packaging/queue" replace />} />
      <Route path="/confirmation" element={<Navigate to="/employee/confirmation/dashboard" replace />} />
      
      {/* Confirmation Role Routes */}
      <Route path="/employee/confirmation/dashboard" element={<EmployeeLayout mode="confirmation"><ConfirmationDashboard /></EmployeeLayout>} />
      <Route path="/employee/confirmation/clients" element={<EmployeeLayout mode="confirmation"><ConfirmationClients /></EmployeeLayout>} />
      <Route path="/employee/confirmation/clientsagadir" element={<EmployeeLayout mode="confirmation"><ConfirmationClientsAgadir /></EmployeeLayout>} />
      <Route path="/employee/confirmation/retourner" element={<EmployeeLayout mode="confirmation"><ConfirmationRetourner /></EmployeeLayout>} />
      <Route path="/employee/confirmation/tasks" element={<EmployeeLayout mode="confirmation"><EmployeeTaskPage /></EmployeeLayout>} />
      <Route path="/employee/confirmation/leaderboard" element={<EmployeeLayout mode="confirmation"><Leaderboard /></EmployeeLayout>} />

      {/* Packaging Role Routes */}
      <Route path="/employee/packaging/dashboard" element={<EmployeeLayout mode="packaging"><PackagingDashboard /></EmployeeLayout>} />
      <Route path="/employee/packaging/queue" element={<EmployeeLayout mode="packaging"><PackagingQueue /></EmployeeLayout>} />
      <Route path="/employee/packaging/tasks" element={<EmployeeLayout mode="packaging"><EmployeeTaskPage /></EmployeeLayout>} />

      {/* Confirmation Manager Role Routes */}
      <Route path="/employee/confirmation-manager/dashboard" element={<EmployeeLayout mode="confirmation_manager"><ConfirmationDashboard /></EmployeeLayout>} />
      <Route path="/employee/confirmation-manager/clients" element={<EmployeeLayout mode="confirmation_manager"><ListPipeline /></EmployeeLayout>} />
      <Route path="/employee/confirmation-manager/investissement" element={<EmployeeLayout mode="confirmation_manager"><ConfirmationManagerInvestment /></EmployeeLayout>} />
      <Route path="/employee/confirmation-manager/versements" element={<EmployeeLayout mode="confirmation_manager"><VersementEmployeeManager /></EmployeeLayout>} />
      <Route path="/employee/confirmation-manager/tasks" element={<EmployeeLayout mode="confirmation_manager"><EmployeeTaskPage /></EmployeeLayout>} />

      {/* Delivery Role Routes */}
      <Route path="/employee/delivery/dashboard" element={<EmployeeLayout mode="delivery"><DeliveryDashboard /></EmployeeLayout>} />
      <Route path="/employee/delivery/run" element={<EmployeeLayout mode="delivery"><DeliveryRunPage /></EmployeeLayout>} />
      <Route path="/employee/delivery/portefeuille" element={<EmployeeLayout mode="delivery"><Portefeuille /></EmployeeLayout>} />
      <Route path="/employee/delivery/tasks" element={<EmployeeLayout mode="delivery"><EmployeeTaskPage /></EmployeeLayout>} />



      <Route path="/admin/logs" element={<AdminLayout><LogsPage /></AdminLayout>} />

    </Routes>
  );
}