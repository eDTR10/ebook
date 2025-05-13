import axios from '../plugin/axios';

// Define TypeScript interfaces for our data structures
export interface Equipment {
  name: string;
  quantity: number;
}

export interface Booking {
  id?: number;
  start_date: string;
  end_date: string;
  activity_title: string;
  requestor_name: string;
  start_time: string;
  end_time: string;
  equipment: Equipment[];
  user: number;
  remarks: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Get all bookings
 */
export const getAllBookings = (): Promise<Booking[]> => {
  const token = localStorage.getItem('Token');
  
  if (!token) {
    return Promise.reject(new Error('Authentication token not found'));
  }
  
  return new Promise((resolve, reject) => {
    axios.get('booking/all/')
      .then((response) => {
        console.log('API Response:', response.data);
        
        // Case 1: If the API returns { success: true, data: [...] } structure
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          if (response.data.success) {
            resolve(response.data.data);
          } else {
            reject(new Error(response.data.message || 'Failed to fetch bookings'));
          }
        } 
        // Case 2: If the API directly returns the array of bookings
        else if (Array.isArray(response.data)) {
          resolve(response.data);
        }
        // Case 3: If the API has a different structure
        else if (response.data && typeof response.data === 'object') {
          // Check common alternative properties
          if (Array.isArray(response.data.results)) {
            resolve(response.data.results);
          } else if (Array.isArray(response.data.bookings)) {
            resolve(response.data.bookings);
          } else {
            console.error('Unexpected API response structure:', response.data);
            reject(new Error('Unexpected API response structure'));
          }
        } else {
          reject(new Error('Invalid response format'));
        }
      })
      .catch((error) => {
        console.error('Error fetching bookings:', error);
        reject(error);
      });
  });
};

/**
 * Get a single booking by ID
 */
export const getBookingById = (id: number): Promise<Booking> => {
  const token = localStorage.getItem('Token');
  
  if (!token) {
    return Promise.reject(new Error('Authentication token not found'));
  }
  
  return new Promise((resolve, reject) => {
    axios.get(`booking/${id}/`)
      .then((response) => {
        console.log('API Response:', response.data);
        
        if (response.data && typeof response.data === 'object') {
          // If the API returns the booking directly
          if ('id' in response.data || 'activity_title' in response.data) {
            resolve(response.data);
          }
          // If the API wraps the booking in a data property
          else if (response.data.data && typeof response.data.data === 'object') {
            resolve(response.data.data);
          } else {
            reject(new Error('Booking not found'));
          }
        } else {
          reject(new Error('Invalid response format'));
        }
      })
      .catch((error) => {
        console.error(`Error fetching booking with ID ${id}:`, error);
        reject(error);
      });
  });
};

/**
 * Create a new booking
 */
export const createBooking = (bookingData: Omit<Booking, 'id'>): Promise<Booking> => {
  const token = localStorage.getItem('Token');
  
  if (!token) {
    return Promise.reject(new Error('Authentication token not found'));
  }
  
  return new Promise((resolve, reject) => {
    axios.post('booking/all/', bookingData)
      .then((response) => {
        console.log('API Response:', response.data);
        
        if (response.data && typeof response.data === 'object') {
          // If the API returns success: true and the created booking
          if ('success' in response.data && response.data.success) {
            resolve(response.data.data || response.data.booking);
          }
          // If the API returns the booking directly
          else if ('id' in response.data) {
            resolve(response.data);
          } else {
            reject(new Error('Failed to create booking'));
          }
        } else {
          reject(new Error('Invalid response format'));
        }
      })
      .catch((error) => {
        console.error('Error creating booking:', error);
        reject(error);
      });
  });
};

/**
 * Update an existing booking
 */
export const updateBooking = (id: number, bookingData: Partial<Booking>): Promise<Booking> => {
  const token = localStorage.getItem('Token');
  
  if (!token) {
    return Promise.reject(new Error('Authentication token not found'));
  }
  
  return new Promise((resolve, reject) => {
    axios.put(`booking/${id}/`, bookingData)
      .then((response) => {
        console.log('API Response:', response.data);
        
        if (response.data && typeof response.data === 'object') {
          // If the API returns success: true and the updated booking
          if ('success' in response.data && response.data.success) {
            resolve(response.data.data || response.data.booking);
          }
          // If the API returns the booking directly
          else if ('id' in response.data) {
            resolve(response.data);
          } else {
            reject(new Error('Failed to update booking'));
          }
        } else {
          reject(new Error('Invalid response format'));
        }
      })
      .catch((error) => {
        console.error(`Error updating booking with ID ${id}:`, error);
        reject(error);
      });
  });
};

/**
 * Delete a booking
 */
export const deleteBooking = (id: number): Promise<void> => {
  const token = localStorage.getItem('Token');
  
  if (!token) {
    return Promise.reject(new Error('Authentication token not found'));
  }
  
  return new Promise((resolve, reject) => {
    axios.delete(`booking/${id}/`)
      .then((response) => {
        console.log('API Response:', response.data);
        
        // Most APIs return 204 No Content or a success message
        if (response.status === 204) {
          resolve();
        } else if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          if (response.data.success) {
            resolve();
          } else {
            reject(new Error(response.data.message || 'Failed to delete booking'));
          }
        } else {
          resolve();
        }
      })
      .catch((error) => {
        console.error(`Error deleting booking with ID ${id}:`, error);
        reject(error);
      });
  });
};

// Maintain the original function for backwards compatibility
export const getAllProjects = getAllBookings;