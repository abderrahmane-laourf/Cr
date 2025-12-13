import { storageService } from './storage';

// Base API not needed anymore for fetch, but we keep the structure
const API_BASE = 'http://localhost:3000'; // Deprecated

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate daily rate from monthly salary
 * Formula: Salary / 26 (working days per month)
 */
export const calculateDailyRate = (monthlySalary) => {
  return monthlySalary / 26;
};

/**
 * Calculate hourly rate from daily rate
 * Formula: Daily Rate / 8 (working hours per day)
 */
export const calculateHourlyRate = (dailyRate) => {
  return dailyRate / 8;
};

/**
 * Calculate commission and deduction from presence records
 * @param {number} salary - Employee's monthly salary
 * @param {Array} presenceRecords - Array of presence adjustments
 * @returns {Object} { commission, deduction }
 */
export const calculateSalaryAdjustments = (salary, presenceRecords = []) => {
  const dailyRate = calculateDailyRate(salary);
  const hourlyRate = calculateHourlyRate(dailyRate);

  let commission = 0;
  let deduction = 0;

  presenceRecords.forEach(record => {
    // Calculate day-based adjustments
    if (record.daysAdj > 0) {
      commission += record.daysAdj * dailyRate;
    } else if (record.daysAdj < 0) {
      deduction += Math.abs(record.daysAdj) * dailyRate;
    }

    // Calculate hour-based adjustments
    if (record.hoursAdj > 0) {
      commission += record.hoursAdj * hourlyRate;
    } else if (record.hoursAdj < 0) {
      deduction += Math.abs(record.hoursAdj) * hourlyRate;
    }
  });

  return {
    commission: Math.round(commission * 100) / 100, // Round to 2 decimals
    deduction: Math.round(deduction * 100) / 100,
    dailyRate: Math.round(dailyRate * 100) / 100,
    hourlyRate: Math.round(hourlyRate * 100) / 100
  };
};

/**
 * Helper to simulate async behavior for compatibility
 */
const asyncWrapper = (fn) => {
  return new Promise((resolve, reject) => {
    try {
      const result = fn();
      setTimeout(() => resolve(result), 100); // Simulate network latency
    } catch (error) {
      reject(error);
    }
  });
};

// ============================================
// EMPLOYEE API
// ============================================

export const employeeAPI = {
  getAll() {
    return asyncWrapper(() => storageService.getAll('employees'));
  },
  getById(id) {
    return asyncWrapper(() => storageService.getById('employees', id));
  },
  create(employeeData) {
    return asyncWrapper(() => storageService.add('employees', employeeData));
  },
  update(id, employeeData) {
    return asyncWrapper(() => storageService.update('employees', id, employeeData));
  },
  patch(id, updates) {
    return asyncWrapper(() => storageService.update('employees', id, updates));
  },
  delete(id) {
    return asyncWrapper(() => storageService.delete('employees', id));
  }
};

// ============================================
// PRESENCE API
// ============================================

export const presenceAPI = {
  getAll(filters = {}) {
    return asyncWrapper(() => {
      let records = storageService.getAll('presence');
      
      if (filters.employeeId) {
        records = records.filter(r => r.employeeId == filters.employeeId);
      }
      
      // Client-side filtering for month
      if (filters.month) {
        records = records.filter(r => r.date.startsWith(filters.month));
      }

      return records;
    });
  },
  create(presenceData) {
    return asyncWrapper(() => storageService.add('presence', presenceData));
  },
  update(id, presenceData) {
    return asyncWrapper(() => storageService.update('presence', id, presenceData));
  },
  delete(id) {
    return asyncWrapper(() => storageService.delete('presence', id));
  }
};

// ============================================
// PAYMENT API
// ============================================

export const paymentAPI = {
  getAll(employeeId = null) {
    return asyncWrapper(() => {
      let records = storageService.getAll('payments');
      if (employeeId) {
        records = records.filter(p => p.employeeId == employeeId);
      }
      return records;
    });
  },
  create(paymentData) {
    return asyncWrapper(() => storageService.add('payments', paymentData));
  },
  delete(id) {
    return asyncWrapper(() => storageService.delete('payments', id));
  },
  async calculatePayment(employeeId, month) {
    try {
      // Fetch employee to get base salary
      const employee = await employeeAPI.getById(employeeId);
      
      // Fetch presence records for this month
      const presenceRecords = await presenceAPI.getAll({ employeeId, month });
      
      // Calculate adjustments
      const { commission, deduction, dailyRate, hourlyRate } = 
        calculateSalaryAdjustments(employee.salary, presenceRecords);
      
      const basic = employee.salary;
      const net = basic + commission - deduction;

      return {
        basic,
        commission,
        deduction,
        net: Math.round(net * 100) / 100,
        dailyRate,
        hourlyRate,
        presenceCount: presenceRecords.length
      };
    } catch (error) {
      console.error('Error calculating payment:', error);
      throw error;
    }
  }
};

// ============================================
// PRODUCT API
// ============================================

export const productAPI = {
  getAll(filters = {}) {
    return asyncWrapper(() => {
      let products = storageService.getAll('products');
      if (filters.type) {
        products = products.filter(p => p.type === filters.type);
      }
      if (filters.categorie) {
        products = products.filter(p => p.categorie === filters.categorie);
      }
      return products;
    });
  },
  getById(id) {
    return asyncWrapper(() => storageService.getById('products', id));
  },
  create(productData) {
    return asyncWrapper(() => storageService.add('products', productData));
  },
  update(id, productData) {
    return asyncWrapper(() => storageService.update('products', id, productData));
  },
  patch(id, updates) {
    return asyncWrapper(() => storageService.update('products', id, updates));
  },
  delete(id) {
    return asyncWrapper(() => storageService.delete('products', id));
  },
  async getLowStock() {
    return asyncWrapper(() => {
      const products = storageService.getAll('products');
      return products.filter(p => p.stock <= p.alerteStock);
    });
  },
  async getByCategory(categorie) {
    return this.getAll({ categorie });
  },
  async getByType(type) {
    return this.getAll({ type });
  }
};

// ============================================
// GENERIC API HELPERS FOR OTHER RESOURCES
// ============================================

// Helper factory for other resources not strictly defined above but used in app
// We need to support any other fetch calls that were happening.
// Based on db.json, we have: productions, warehouses, stockMovements, stockTransfers, clients, villes, quartiers, losses, ads, tasks

const createGenericAPI = (collectionName) => ({
  getAll(filters = {}) {
     return asyncWrapper(() => {
       let items = storageService.getAll(collectionName);
       // Simple filter matching
       Object.keys(filters).forEach(key => {
         items = items.filter(item => item[key] == filters[key]);
       });
       return items;
     });
  },
  getById(id) {
    return asyncWrapper(() => storageService.getById(collectionName, id));
  },
  create(data) {
    return asyncWrapper(() => storageService.add(collectionName, data));
  },
  update(id, data) {
    return asyncWrapper(() => storageService.update(collectionName, id, data));
  },
  delete(id) {
    return asyncWrapper(() => storageService.delete(collectionName, id));
  }
});

export const productionAPI = createGenericAPI('productions');
export const warehouseAPI = createGenericAPI('warehouses');
export const stockMovementAPI = createGenericAPI('stockMovements');
export const stockTransferAPI = createGenericAPI('stockTransfers');
export const clientAPI = createGenericAPI('clients');
export const villeAPI = createGenericAPI('villes');
export const quartierAPI = createGenericAPI('quartiers');
export const lossAPI = createGenericAPI('losses');
export const adsAPI = createGenericAPI('ads');
export const businessAPI = createGenericAPI('businesses');
export const taskAPI = createGenericAPI('tasks');
export const pipelineAPI = createGenericAPI('pipelines');
export const affectationAPI = createGenericAPI('affectations');

export const settingsAPI = {
  // Generic helper to get/set lists
  getList: (key, defaults = []) => {
    const saved = localStorage.getItem(key);
    if (!saved) {
      // Seed defaults if nothing saved
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },
  
  saveList: (key, list) => {
    localStorage.setItem(key, JSON.stringify(list));
    return list;
  },

  // Specific Getters with Defaults
  getProductTypes: () => settingsAPI.getList('settings_product_types', ['Matière Première', 'Fabriqué', 'Produit Pré']),
  getProductCategories: () => settingsAPI.getList('settings_product_categories', ['Cosmétique', 'Alimentaire', 'Pharmaceutique', 'Autre']),
  getUnits: () => settingsAPI.getList('settings_units', ['ml', 'L', 'g', 'kg', 'unité', 'pièce']),
  getStores: () => settingsAPI.getList('settings_stores', ['Magasin Principal', 'Magasin Secondaire', 'Entrepôt A', 'Entrepôt B']),
  getBusinesses: () => settingsAPI.getList('settings_businesses', ['Herboclear', 'Commit', 'Other']),
  getQuartiersAgadir: () => settingsAPI.getList('settings_quartiers_agadir', ['Talborjt', 'Founty', 'Agadir Centre', 'Inezgane', 'Anza']),
  getPackagingTypes: () => settingsAPI.getList('settings_packaging_types', ['Carton Standard', 'Sachet Plastique', 'Enveloppe', 'Papier Bulle']),
  
  // Generic Updater
  updateList: (key, newList) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            settingsAPI.saveList(key, newList);
            resolve(newList);
        }, 300); // Simulate network delay
    });
  },

  // Delivery Configuration
  getDeliveryConfig: () => {
    const saved = localStorage.getItem('settings_delivery_config');
    if (!saved) {
      const defaults = {
        prixLivraisonAmmex: 30,
        prixLivraisonAgadir: 20
      };
      localStorage.setItem('settings_delivery_config', JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  updateDeliveryConfig: (config) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('settings_delivery_config', JSON.stringify(config));
        resolve(config);
      }, 300);
    });
  },

  // Debt Print Configuration
  getDebtPrintConfig: () => {
    const saved = localStorage.getItem('settings_debt_print_config');
    if (!saved) {
      const defaults = {
        showDate: true,
        showSupplier: true,
        showAmount: true,
        showStatus: true,
        showDescription: true,
        companyName: 'Ma Société',
        footerText: 'Merci de votre confiance.'
      };
      localStorage.setItem('settings_debt_print_config', JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  updateDebtPrintConfig: (config) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('settings_debt_print_config', JSON.stringify(config));
        resolve(config);
      }, 300);
    });
  }
};

// Delivery Payment API
export const deliveryPaymentAPI = createGenericAPI('deliveryPayments');

// Add specific method for updating prices
deliveryPaymentAPI.updatePrices = (id, priceData) => {
  return asyncWrapper(() => {
    const payments = storageService.getAll('deliveryPayments');
    const payment = payments.find(p => p.id === id);
    if (payment) {
      payment.prixColis = priceData.prixColis;
      payment.updatedAt = new Date().toISOString();
      storageService.update('deliveryPayments', id, payment);
    }
    return payment;
  });
};

// Export all APIs as a single object
export default {
  employee: employeeAPI,
  presence: presenceAPI,
  payment: paymentAPI,
  product: productAPI,
  production: productionAPI,
  warehouse: warehouseAPI,
  stockMovement: stockMovementAPI,
  stockTransfer: stockTransferAPI,
  client: clientAPI,
  ville: villeAPI,
  quartier: quartierAPI,
  loss: lossAPI,
  ads: adsAPI,
  business: businessAPI,
  task: taskAPI,
  pipeline: pipelineAPI,
  settings: settingsAPI,
  deliveryPayment: deliveryPaymentAPI,
  
  // Helpers
  calculateDailyRate,
  calculateHourlyRate,
  calculateSalaryAdjustments
};
