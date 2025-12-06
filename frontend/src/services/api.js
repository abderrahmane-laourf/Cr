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
export const taskAPI = createGenericAPI('tasks');

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
  task: taskAPI,
  
  // Helpers
  calculateDailyRate,
  calculateHourlyRate,
  calculateSalaryAdjustments
};
