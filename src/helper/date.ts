/**
 * Format a date string to the format "Month Day, Year" (e.g., "January 2, 2025")
 * @param dateString Date string in format YYYY-MM-DD
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format date as "Month Day, Year"
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  /**
   * Calculate the number of days between two dates (inclusive)
   * @param startDate Start date in format YYYY-MM-DD
   * @param endDate End date in format YYYY-MM-DD
   * @returns Number of days between dates, including both start and end dates
   */
  export const calculateDaysBetween = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }
    
    // Calculate the difference in milliseconds
    const diffTime = Math.abs(end.getTime() - start.getTime());
    
    // Convert to days and add 1 to include both start and end dates
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };
  
  /**
   * Format a date range as a string
   * @param startDate Start date in format YYYY-MM-DD
   * @param endDate End date in format YYYY-MM-DD
   * @returns Formatted date range with duration
   */
  export const formatDateRange = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return '';
    
    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
    const days = calculateDaysBetween(startDate, endDate);
    
    return `${formattedStart} - ${formattedEnd} (${days} days)`;
  };