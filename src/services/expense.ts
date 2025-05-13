import axios from '../plugin/axios';

// Expense interfaces
export interface Expense {
  id: number;
  item: string;
  category: string;
  remarks: string;
  date: string;
  amount: number;
  project_id: number;
}

// Create expense interface
export interface CreateExpenseData {
    item: string;
    category: string;
    remarks: string;
    date: string;
    amount: string | number;
    project_id: number;
  }
  
// API response interface
// interface ApiResponse<T> {
//   success: boolean;
//   data: T;
//   message?: string;
// }

/**
 * Creates a new expense
 * @param expenseData The expense data to create
 * @returns Promise with the created expense
 */
export const createExpense = (expenseData: CreateExpenseData): Promise<Expense> => {
  const token = localStorage.getItem('eprojex_auth_token');
  
  if (!token) {
    return Promise.reject(new Error('Authentication token not found'));
  }
  
  // Transform the data to match the required JSON structure
  const transformedData = {
    item: expenseData.item,
    category: expenseData.category,
    remarks: expenseData.remarks,
    date: expenseData.date,
    amount: expenseData.amount,
    proj_id: expenseData.project_id
  };
  
  return new Promise((resolve, reject) => {
    axios.post('expenses/all/', transformedData)
      .then((response) => {
        // Log the response for debugging
        console.log('Create Expense Response:', response.data);
        
        // SUCCESS: If we get here with a 2xx status code, consider it a success
        // regardless of the response structure
        
        // Case 1: If API returns { success: true, data: {...} } format
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          if (response.data.success) {
            resolve(response.data.data);
          } else {
            reject(new Error(response.data.message || 'Failed to create expense'));
          }
        }
        // Case 2: If API directly returns the created expense object
        else if (response.data && typeof response.data === 'object') {
          resolve(response.data);
        }
        // Case 3: If API returns some other success indication
        else {
          // Just resolve with whatever we got since we received a 2xx status
          resolve(response.data || { success: true });
        }
      })
      .catch((error) => {
        console.error('Error creating expense:', error);
        reject(error);
      });
  });
};

/**
 * Get all expenses for a project
 * @param projectId The ID of the project
 * @returns Promise with an array of expenses
 */
export const getProjectExpenses = (projectId: number): Promise<Expense[]> => {
  return new Promise((resolve, reject) => {
    axios.get(`expenses/all/${projectId}/`)
      .then((response) => {
        // Log the response for debugging
        console.log('Get Project Expenses Response:', response.data);
        
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          if (response.data.success) {
            resolve(response.data.data);
          } else {
            reject(new Error(response.data.message || 'Failed to fetch expenses'));
          }
        } else if (Array.isArray(response.data)) {
          resolve(response.data);
        } else {
          console.error('Unexpected API response format:', response.data);
          reject(new Error('Unexpected API response format'));
        }
      })
      .catch((error) => {
        console.error('Error fetching project expenses:', error);
        reject(error);
      });
  });
};

/**
 * Delete an expense
 * @param expenseId The ID of the expense to delete
 * @returns Promise with any response data
 */
export const deleteExpense = (expenseId: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios.delete(`expenses/${expenseId}/`)
      .then((response) => {
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          if (response.data.success) {
            resolve(response.data.data);
          } else {
            reject(new Error(response.data.message || 'Failed to delete expense'));
          }
        } else {
          resolve(response.data || { success: true });
        }
      })
      .catch((error) => {
        console.error('Error deleting expense:', error);
        reject(error);
      });
  });
};