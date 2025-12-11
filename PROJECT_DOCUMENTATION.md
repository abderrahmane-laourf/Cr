# CRM_TEST - Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [File Categories](#file-categories)
6. [Detailed File Descriptions](#detailed-file-descriptions)

---

## 🎯 Project Overview

**CRM_TEST** is a comprehensive Customer Relationship Management (CRM) system built with React. It provides a full-featured admin dashboard for managing employees, stock, products, pipeline, production, and various business operations.

### Key Capabilities:
- Multi-role authentication (Admin, Employee, Manager, Delivery, etc.)
- Complete HR management (employees, permissions, attendance, payments)
- Inventory & stock management with transfers and movements
- Sales pipeline with Kanban board
- Product catalog management
- Production tracking
- Financial management (debts, petite caisse, commissions)
- Advertising campaigns tracking
- Task management
- Assets management
- Employee-product affectations

---

## 🛠️ Technology Stack

### Frontend Framework
- **React 19.2.0** - UI library
- **React Router DOM 7.10.0** - Routing
- **Vite 7.2.4** - Build tool & dev server

### Styling
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **Lucide React 0.555.0** - Icon library

### Data Visualization
- **Recharts 3.5.1** - Chart library for dashboards

### Additional Libraries
- **SweetAlert2 11.26.3** - Beautiful alerts/modals
- **localStorage** - Client-side data persistence

---

## 📁 Project Structure

```
CRM_TEST/
├── frontend/
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/          # Images, fonts
│   │   ├── components/      # Reusable components
│   │   │   ├── layout/     # Layout components
│   │   │   └── login/      # Authentication components
│   │   ├── data/           # Initial data & constants
│   │   ├── page/           # Page components
│   │   │   ├── admin/     # Admin pages
│   │   │   └── employee/  # Employee pages
│   │   ├── services/      # API & storage services
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── db.json            # Mock database
│   ├── package.json       # Dependencies
│   ├── vite.config.js     # Vite configuration
│   └── vercel.json        # Deployment config
├── COMMISSIONS_GUIDE.md
└── PATH_GUIDE.md
```

---

## 🎨 Core Features

### 1. Authentication & Authorization
- Multi-role login system
- Password strength validation
- Forgot password flow
- Token verification
- Role-based routing

### 2. HR Management
- Employee CRUD operations
- 3-step employee onboarding (Info, Documents, Access)
- Permission management (15 module categories)
- Attendance tracking
- Payment management
- Employee affectations to products

### 3. Inventory Management
- Stock listing with real-time quantities
- Stock movements tracking
- Stock transfers between locations
- Stock dashboard with analytics
- Loss management

### 4. Sales Pipeline
- Kanban board view
- List view
- Pipeline dashboard
- Stage management

### 5. Product Management
- Product catalog
- Product dashboard
- Category management

### 6. Production
- Production tracking
- Production dashboard
- Manufacturing management

### 7. Financial
- Debts tracking
- Petite caisse (petty cash)
- Commissions calculation
- Payment processing

### 8. Marketing
- Ad campaigns management
- Ads dashboard

### 9. Assets & Operations
- Assets management
- Task management
- Business configuration
- Reports generation

---

## 📂 File Categories

### 🔐 Authentication Components
- `Login.jsx` - Main login page with validation
- `forgotpassword.jsx` - Password recovery
- `verifytocken.jsx` - Token verification
- `newpassword.jsx` - Reset password

### 🎨 Layout Components
- `layout.jsx` - Admin layout with sidebar & header (600+ lines)
- `employeeLayout.jsx` - Employee-specific layout
- `responsive.jsx` - Responsive utilities

### 👥 Admin Pages - HR

#### Employee Management
- **`employee.jsx`** (654 lines)
  - 3-step form modal: Personal Info, Documents, Access
  - Fields: Name, Phone, CIN, CNSS, Salary, Bank, RIB, Business
  - Documents: CIN, Contract, Diploma, Non-Compete Agreement
  - CRUD operations with localStorage sync

#### Permissions
- **`permissions.jsx`** (551 lines)
  - Employee permission matrix
  - 15 module categories with action-based permissions
  - Expandable categories (closed by default)
  - CRUD action buttons (view, create, edit, delete)
  - localStorage synchronization with employee data

#### Affectations
- **`affectations.jsx`** (600+ lines)
  - Assign employees to products
  - Two product types:
    - 🛍️ Produits à Vendre (multiple selection)
    - 📦 Produits Actifs (single selection)
  - WhatsApp numbers management (collapsible)
  - Phone numbers management (collapsible)
  - Sidebar with number lists (copy functionality)
  - localStorage persistence

#### Other HR Pages
- `employeeDashboard.jsx` - HR analytics
- `presence.jsx` - Attendance tracking
- `paiement.jsx` - Payment management
- `business.jsx` - Business configuration

### 📦 Stock Management
- **`stock.jsx`** - Stock listing & management
- **`stockDashboard.jsx`** - Stock analytics
- **`stockMovements.jsx`** - Movement history
- **`stockTransfer.jsx`** - Transfer between locations
- **`losses.jsx`** - Loss tracking

### 🔄 Pipeline Management
- **`managementpipeline.jsx`** - Kanban board
- **`listpipeline.jsx`** - List view
- **`pipelineDash.jsx`** - Pipeline analytics
- **`pipelineDashboard.jsx`** - Advanced dashboard

### 📊 Product Management
- **`products.jsx`** - Product catalog
- **`productDashboard.jsx`** - Product analytics

### 🏭 Production
- **`production.jsx`** - Production management
- **`productionDashboard.jsx`** - Production analytics

### 💰 Financial Management
- **`debts.jsx`** - Debt tracking
- **`debtsDashboard.jsx`** - Debt analytics
- **`petitecaisse.jsx`** - Petty cash
- **`petitecaisseDashboard.jsx`** - Petty cash analytics
- **`commissions.jsx`** - Commission calculations

### 📢 Marketing
- **`ads.jsx`** - Ad campaign management
- **`adsDashboard.jsx`** - Ad analytics

### 🔧 Operations
- **`actifs.jsx`** - Assets management
- **`assetsDashboard.jsx`** - Assets analytics
- **`listtask.jsx`** - Task management
- **`rapports.jsx`** - Reports

### 📈 Dashboards
- **`generalDashboard.jsx`** - Main admin dashboard
- **`Dashboard.jsx`** - Alternative dashboard
- **`globalDashboard.jsx`** - Global overview
- **`dashboardactifs.jsx`** - Assets dashboard
- **`dashboarddetts.jsx`** - Debts dashboard

### 👔 Employee Pages
- **Confirmation Module**
  - `confirmation/dashboard.jsx` - Confirmation dashboard
  - `confirmation/clients.jsx` - Client confirmations
  - `confirmation/leaderboard.jsx` - Performance leaderboard

- **Packaging Module**
  - `packaging/queue.jsx` - Packaging queue
  - `packaging/dashboard.jsx` - Packaging dashboard

- **Delivery Module**
  - `delivery/dashboard.jsx` - Delivery overview
  - `delivery/manager_dispatch.jsx` - Dispatch management
  - `delivery/run.jsx` - Delivery runs

- **Tasks**
  - `tasks.jsx` - Employee task list

### 🛠️ Services
- **`api.js`** - API service layer
  - Task API endpoints
  - Employee API endpoints
  - Generic CRUD operations

- **`storage.js`** - localStorage utilities

### 📊 Data
- **`initialData.js`** - Mock data & constants
  - PERMISSION_MODULES (15 categories)
  - Default employee data
  - Business data

### ⚙️ Configuration
- **`App.jsx`** - Main routing configuration
  - Public routes (login, forgot password)
  - Admin routes (wrapped with AdminLayout)
  - Employee routes (wrapped with EmployeeLayout)
  - Navigation guards

- **`vite.config.js`** - Vite build configuration
- **`vercel.json`** - Vercel deployment settings
- **`eslint.config.js`** - ESLint rules
- **`tailwind.config.js`** - Tailwind customization

---

## 📝 Detailed File Descriptions

### Core Application Files

#### `App.jsx`
**Purpose:** Central routing hub
**Key Routes:**
- `/` - Login page
- `/admin/*` - Admin routes (16+ pages)
- `/employee/*` - Employee routes (3 modules)
**Features:** Role-based access control, automatic redirects

#### `main.jsx`
**Purpose:** Application entry point
**Responsibilities:** React DOM rendering, Router setup

#### `index.css`
**Purpose:** Global styles
**Includes:** Tailwind directives, custom scrollbars, animations

---

### Layout System

#### `layout.jsx` (600+ lines)
**Components:**
1. **PrimaryRail** - Icon navigation (16 modules)
   - Dashboard, RH, Stock, Pipeline, Products, Purchases, Production, Losses, Ads, Tasks, Assets, Debts, Petite Caisse, Reports, Settings
2. **SecondaryPanel** - Expandable submenu (w-64)
3. **TopHeader** - Search, notifications (30s sync), profile
4. **MainContent** - Page rendering area

**Features:**
- Active module detection
- Notification sync from task API
- Tooltip system
- Mobile responsive menu

#### `employeeLayout.jsx`
**Purpose:** Employee-specific layout
**Features:**
- Simplified navigation
- Role-based menu items
- Employee profile display

---

### Authentication Flow

#### `Login.jsx` (331 lines)
**Features:**
- Login/password validation
- Password strength indicator (4 levels)
- Error handling with inline messages
- Toast notifications
- Role-based routing after login
- "Remember me" functionality
- Forgot password link
- Right-side image display

**Validation Rules:**
- Login: minimum 3 characters
- Password: minimum 4 characters
- Real-time error feedback

**User Roles:**
- admin → `/admin/dashboard`
- confirmation_manager → `/employee/confirmation-manager/dashboard`
- delivery → `/employee/delivery/dashboard`
- packaging → `/employee/packaging/queue`
- etc.

#### `forgotpassword.jsx`
**Flow:** Email input → Verification

#### `verifytocken.jsx`
**Flow:** Token validation → Reset password

#### `newpassword.jsx`
**Flow:** New password form with confirmation

---

### HR Management System

#### `employee.jsx` (654 lines)
**Multi-Step Form:**

**Step 1 - Infos Personnelles:**
- Nom complet
- Téléphone Personnel
- CIN (National ID)
- CNSS (Social Security)
- Salaire
- Banque
- RIB (Bank account)
- Business (select dropdown)

**Step 2 - Documents:**
- CIN (upload)
- Contrat (contract)
- Diplôme (diploma)
- Non-Compete Agreement

**Step 3 - Accès:**
- Login
- Mot de passe
- Rôle (Admin, Manager, Employee, etc.)

**Features:**
- Search & filter functionality
- Role/Business filters
- Table display with pagination
- CRUD operations
- localStorage sync
- Document upload handling
- Form validation

**Data Model:**
```javascript
{
  id: number,
  name: string,
  phone: string,
  cin: string,
  cnss: string,
  salary: number,
  bank: string,
  rib: string,
  business: string,
  login: string,
  password: string,
  role: string,
  permissions: [],
  documents: {},
  active: boolean
}
```

#### `permissions.jsx` (551 lines)
**Layout:**
- Employee table (left): Name, Role, Login, Phone, Permissions count, Actions
- Permission modal (right): Wide layout (max-w-5xl)

**15 Permission Categories:**
1. **Tableau de bord** - main_dashboard (view)
2. **Ressources Humaines** - hr_dashboard, emp-list, emp-pay, emp-presence, emp-perm, emp-affect
3. **Gestion de Stock** - stock-dash, stock-state, stock-transfer, stock-move
4. **Pipeline** - pipeline-dash, pipeline-kanban, pipeline-list
5. **Catalogue** - prod-dash, prod-list
6. **Achats** - buy-bon, buy-supp
7. **Production** - prod-production-dash, prod-manage
8. **Gestion des pertes** - pertes-list
9. **Publicité** - ads-dash, ads-list
10. **Tâches** - task-list
11. **Actifs** - actifs-dash, actifs-list
12. **Dettes** - debts-dash, debts-list
13. **Petite Caisse** - petitecaisse-list
14. **Rapports** - rapports-list
15. **Paramètres** - business

**Action Types:**
- 👁️ View (Eye icon)
- ➕ Create (Plus icon)
- ✏️ Edit (Edit2 icon)
- 🗑️ Delete (Trash2 icon)

**Features:**
- Category-level actions (Edit, Add, Delete buttons)
- Expandable/collapsible categories
- Checkbox system for permissions
- localStorage sync with employee data
- Search & role filter
- Permission count badge

**Permission Format:** `"moduleID:actionID"` (e.g., "emp-list:create")

#### `affectations.jsx` (600+ lines)
**Purpose:** Assign employees to products with contact numbers

**Modal Structure:**

1. **Employee Selection:**
   - Dropdown with search
   - Shows login & phone on selection

2. **🛍️ Produits à Vendre (Collapsible):**
   - Searchable dropdown
   - Multiple product selection
   - "Ajouter à Vendre" button
   - Yellow badges
   - Remove capability

3. **📦 Produits Actifs (Collapsible):**
   - Searchable dropdown
   - Single product selection
   - "Ajouter Actif" button
   - Blue badges

4. **WhatsApp Numbers (Collapsible):**
   - Input field
   - Add button (Plus)
   - List with remove buttons
   - Green badges

5. **Phone Numbers (Collapsible):**
   - Input field
   - Add button (Plus)
   - List with remove buttons
   - Blue badges

**Main Table:**
- Employee name
- Products (yellow = vendre, blue = actifs)
- WhatsApp count preview
- Phone count preview
- Edit/Delete actions

**Sidebar Lists:**
- **WhatsApp List:**
  - Number (copyable)
  - Employee name
  - Products (vendre & actifs)
  
- **Phone List:**
  - Number (copyable)
  - Employee name
  - Products (vendre & actifs)

**Features:**
- Search by employee/product
- Filter: All, WhatsApp only, Phone only
- localStorage persistence
- Copy to clipboard
- Toast notifications

**Data Model:**
```javascript
{
  id: number,
  employeeId: number,
  productIdsVendre: [number],
  productIdActif: number,
  whatsappNumbers: [string],
  teleNumbers: [string]
}
```

---

### Stock Management

#### `stock.jsx`
**Features:**
- Product listing with quantities
- Stock levels (low/medium/high)
- Add/Edit/Delete stock
- Stock adjustment
- Category filter
- Search functionality

#### `stockMovements.jsx`
**Tracks:**
- Movement type (IN/OUT/TRANSFER)
- Product
- Quantity
- Date & time
- User responsible
- Notes

#### `stockTransfer.jsx`
**Features:**
- Source location selection
- Destination location
- Product selection
- Quantity transfer
- Transfer history

---

### Pipeline Management

#### `managementpipeline.jsx`
**Kanban Board:**
- Drag & drop cards
- Custom columns (stages)
- Card details modal
- Progress tracking
- Deal value calculation

**Columns:**
- Nouveau
- Contact
- Qualifié
- Proposition
- Négociation
- Gagné
- Perdu

---

### Dashboards

#### `generalDashboard.jsx`
**Widgets:**
- Revenue chart
- Sales by category
- Recent orders
- Top products
- Team performance
- Key metrics (KPIs)

**Charts:**
- Line chart (revenue over time)
- Bar chart (sales by product)
- Pie chart (category distribution)
- Area chart (trends)

---

### Common Features Across Files

#### UI Patterns
- **Toast Notifications:** Success/Error messages
- **Modal System:** Add/Edit forms
- **Search Bars:** Real-time filtering
- **Filter Dropdowns:** Multi-criteria filtering
- **Action Buttons:** Edit (blue), Delete (red), View (gray)
- **Status Badges:** Color-coded (green/yellow/red)
- **Pagination:** Table navigation
- **Sorting:** Column headers

#### Data Patterns
- **localStorage:** Primary persistence layer
- **API Integration:** Backend communication ready
- **Mock Data:** Fallback for development
- **State Management:** React hooks (useState, useEffect)

#### Styling System
- **Tailwind Classes:** Utility-first approach
- **Color Palette:**
  - Primary: #1325ec (blue)
  - Success: emerald-500
  - Warning: yellow-500
  - Danger: red-500
  - Gray: slate-50 to slate-900
- **Spacing:** Consistent padding/margins
- **Borders:** Rounded corners (rounded-xl)
- **Shadows:** Layered depth

---

## 🔄 Data Flow

### Authentication Flow
```
Login.jsx 
  → Validate credentials
  → Store user in localStorage
  → Navigate based on role
  → Load appropriate layout
```

### CRUD Flow
```
Page Component
  → User action (Add/Edit/Delete)
  → Modal opens
  → Form validation
  → API call (or localStorage)
  → Update state
  → Show toast notification
  → Refresh data
```

### Permission Flow
```
Employee.jsx (create employee)
  → Save to localStorage with empty permissions[]
  ↓
Permissions.jsx (assign permissions)
  → Load from localStorage
  → Modify permissions array
  → Save back to localStorage
  ↓
Both pages stay synchronized
```

---

## 🎨 Component Hierarchy

```
App.jsx
├── Login.jsx
└── AdminLayout
    ├── PrimaryRail (Sidebar)
    ├── SecondaryPanel (Submenu)
    ├── TopHeader
    └── MainContent
        ├── Admin Pages
        │   ├── HR Module
        │   │   ├── employee.jsx
        │   │   ├── permissions.jsx
        │   │   ├── affectations.jsx
        │   │   ├── presence.jsx
        │   │   └── paiement.jsx
        │   ├── Stock Module
        │   ├── Pipeline Module
        │   ├── Product Module
        │   └── etc.
        └── Employee Pages
            ├── Confirmation Module
            ├── Packaging Module
            └── Delivery Module
```

---

## 📊 Key Metrics & Statistics

- **Total Files:** 68 (JSX/JS/JSON)
- **Admin Pages:** 35+
- **Employee Pages:** 7
- **Layouts:** 3
- **Authentication Pages:** 4
- **Services:** 2
- **Permission Categories:** 15
- **Total Lines of Code:** ~10,000+ (estimated)

### Largest Files
1. `affectations.jsx` - 600+ lines
2. `layout.jsx` - 600+ lines
3. `employee.jsx` - 654 lines
4. `permissions.jsx` - 551 lines
5. `Login.jsx` - 331 lines

---

## 🚀 Deployment

### Development
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Vercel Deployment
- Configured via `vercel.json`
- Auto-deploy from Git
- Environment variables in Vercel dashboard

---

## 🔐 Security Considerations

1. **Authentication:** Role-based access control
2. **Data Validation:** Client-side and server-side
3. **Password Strength:** Visual indicator
4. **localStorage:** Encrypted sensitive data recommended
5. **API Endpoints:** Authentication tokens (to be implemented)

---

## 📈 Future Enhancements

### Planned Features
- [ ] Backend API integration (replace localStorage)
- [ ] Real-time notifications (WebSocket)
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Export/Import functionality
- [ ] Advanced reporting
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Two-factor authentication

### Technical Debt
- [ ] Add unit tests (Jest/Vitest)
- [ ] Add E2E tests (Cypress/Playwright)
- [ ] Improve error boundaries
- [ ] Add loading states
- [ ] Optimize bundle size
- [ ] Add TypeScript
- [ ] Implement code splitting

---

## 📞 Contact & Support

- **Repository:** github.com/abderrahmane-laourf/Cr
- **Branch:** master
- **Version:** 0.0.0 (Development)

---

## 📄 License

Private project - All rights reserved

---

**Last Updated:** December 10, 2025
**Documentation Version:** 1.0.0
