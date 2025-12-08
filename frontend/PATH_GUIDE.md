# Project Path Configuration Guide

This document explains the path configuration for the CRM_TEST frontend project.

## Path Aliases

The project is now configured with the following path aliases to make imports cleaner and more consistent:

### Available Aliases

- `@/` - Root src directory
- `@/components/*` - Components directory
- `@/page/*` - Pages directory  
- `@/services/*` - Services directory
- `@/assets/*` - Assets directory
- `@/data/*` - Data directory

## Usage Examples

### Before (Relative Paths)
```javascript
import { employeeAPI } from '../../services/api';
import { AdminLayout } from '../../components/layout/layout';
import Login from '../../components/login/Login';
```

### After (Cleaner with Aliases)
```javascript
import { employeeAPI } from '@/services/api';
import { AdminLayout } from '@/components/layout/layout';
import Login from '@/components/login/Login';
```

## Benefits

1. **No more path confusion**: No need to count `../` levels
2. **Easier refactoring**: Moving files doesn't break imports
3. **Better readability**: Clear where imports come from
4. **IDE support**: Auto-completion works better

## Configuration Files

### `jsconfig.json`
Configures the path mapping for JavaScript projects and enables IDE features like:
- Auto-imports
- Go to definition  
- Auto-completion

### `vite.config.js`
Configures Vite's module resolution to actually resolve the aliased paths when building/running the app.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── layout.jsx
│   │   │   └── employeeLayout.jsx
│   │   ├── login/
│   │   └── comingSoon.jsx
│   ├── page/
│   │   ├── admin/
│   │   │   ├── employee.jsx
│   │   │   ├── generalDashboard.jsx
│   │   │   └── ...
│   │   └── employee/
│   ├── services/
│   │   ├── api.js
│   │   └── storage.js
│   ├── assets/
│   ├── data/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── jsconfig.json
└── vite.config.js
```

## Migration Guide

You don't need to update your existing imports immediately - both relative and absolute paths will work. However, for new code, it's recommended to use the path aliases.

### Common Import Patterns

**API Services:**
```javascript
import api, { employeeAPI, clientAPI, productAPI } from '@/services/api';
```

**Layout Components:**
```javascript
import { AdminLayout } from '@/components/layout/layout';
import { EmployeeLayout } from '@/components/layout/employeeLayout';
```

**Page Components:**
```javascript
import EmployeesPage from '@/page/admin/employee';
import GeneralDashboard from '@/page/admin/generalDashboard';
```

## Notes

- The configuration has already been applied to both `jsconfig.json` and `vite.config.js`
- You may need to restart your development server for changes to take effect
- Your IDE might need to reload the workspace to recognize the new paths
- All existing relative imports will continue to work
