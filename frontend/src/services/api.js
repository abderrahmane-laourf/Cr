// API Base URL
const API_BASE = 'http://localhost:3000';

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

// ============================================
// EMPLOYEE API
// ============================================

export const employeeAPI = {
  /**
   * Get all employees
   */
  async getAll() {
    const response = await fetch(`${API_BASE}/employees`);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
  },

  /**
   * Get employee by ID
   */
  async getById(id) {
    const response = await fetch(`${API_BASE}/employees/${id}`);
    if (!response.ok) throw new Error('Failed to fetch employee');
    return response.json();
  },

  /**
   * Create new employee
   */
  async create(employeeData) {
    const response = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
  },

  /**
   * Update employee
   */
  async update(id, employeeData) {
    const response = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    });
    if (!response.ok) throw new Error('Failed to update employee');
    return response.json();
  },

  /**
   * Partial update employee (e.g., toggle status)
   */
  async patch(id, updates) {
    const response = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to patch employee');
    return response.json();
  },

  /**
   * Delete employee
   */
  async delete(id) {
    const response = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete employee');
    return response.json();
  }
};

// ============================================
// PRESENCE API
// ============================================

export const presenceAPI = {
  /**
   * Get all presence records (optionally filtered by employee and/or month)
   */
  async getAll(filters = {}) {
    let url = `${API_BASE}/presence`;
    const params = new URLSearchParams();

    if (filters.employeeId) {
      params.append('employeeId', filters.employeeId);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch presence records');
    let records = await response.json();

    // Client-side filtering for month if needed
    if (filters.month) {
      records = records.filter(r => r.date.startsWith(filters.month));
    }

    return records;
  },

  /**
   * Create new presence record
   */
  async create(presenceData) {
    const response = await fetch(`${API_BASE}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(presenceData)
    });
    if (!response.ok) throw new Error('Failed to create presence record');
    return response.json();
  },

  /**
   * Delete presence record
   */
  async delete(id) {
    const response = await fetch(`${API_BASE}/presence/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete presence record');
    return response.json();
  }
};

// ============================================
// PAYMENT API
// ============================================

export const paymentAPI = {
  /**
   * Get all payments (optionally filtered by employee)
   */
  async getAll(employeeId = null) {
    let url = `${API_BASE}/payments`;
    if (employeeId) {
      url += `?employeeId=${employeeId}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch payments');
    return response.json();
  },

  /**
   * Create new payment
   */
  async create(paymentData) {
    const response = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) throw new Error('Failed to create payment');
    return response.json();
  },

  /**
   * Delete payment
   */
  async delete(id) {
    const response = await fetch(`${API_BASE}/payments/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete payment');
    return response.json();
  },

  /**
   * Calculate payment for an employee based on presence
   * @param {number} employeeId - Employee ID
   * @param {string} month - Month in YYYY-MM format
   * @returns {Object} Calculated payment details
   */
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
  /**
   * Get all products (optionally filtered)
   */
  async getAll(filters = {}) {
    let url = `${API_BASE}/products`;
    const params = new URLSearchParams();

    if (filters.type) {
      params.append('type', filters.type);
    }
    if (filters.categorie) {
      params.append('categorie', filters.categorie);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  /**
   * Get product by ID
   */
  async getById(id) {
    const response = await fetch(`${API_BASE}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  /**
   * Create new product
   */
  async create(productData) {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  /**
   * Update product
   */
  async update(id, productData) {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  /**
   * Partial update product
   */
  async patch(id, updates) {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to patch product');
    return response.json();
  },

  /**
   * Delete product
   */
  async delete(id) {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  /**
   * Get products with low stock
   */
  async getLowStock() {
    const products = await this.getAll();
    return products.filter(p => p.stock <= p.alerteStock);
  },

  /**
   * Get products by category
   */
  async getByCategory(categorie) {
    return this.getAll({ categorie });
  },

  /**
   * Get products by type
   */
  async getByType(type) {
    return this.getAll({ type });
  }
};

// Export all APIs as a single object
export default {
  employee: employeeAPI,
  presence: presenceAPI,
  payment: paymentAPI,
  product: productAPI,
  calculateDailyRate,
  calculateHourlyRate,
  calculateSalaryAdjustments
};
