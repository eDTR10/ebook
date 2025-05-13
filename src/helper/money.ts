/**
 * Format a number as currency with thousands separators
 * @param value Number or string to format
 * @param options Formatting options
 * @returns Formatted currency string
 */
export const formatMoney = (
    value: number | string | null | undefined,
    options?: {
      currency?: string;
      decimals?: number;
      showCurrency?: boolean;
    }
  ): string => {
    // Handle null or undefined
    if (value === null || value === undefined) {
      return '';
    }
  
    // Default options
    const currency = options?.currency || '₱';
    const decimals = options?.decimals ?? 2;
    const showCurrency = options?.showCurrency ?? true;
  
    // Parse value to number (handle string inputs)
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  
    // Check if value is a valid number
    if (isNaN(numValue)) {
      return '';
    }
  
    // Format number with commas and fixed decimal places
    const formattedValue = numValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  
    // Return with or without currency symbol
    return showCurrency ? `${currency}${formattedValue}` : formattedValue;
  };
  
  /**
   * Simple function to format a number with commas
   * @param value Number to format
   * @returns String with commas as thousand separators
   */
  export const addCommas = (value: number | string): string => {
    if (!value) return '';
    
    // Convert to string and remove any existing commas or currency symbols
    const numStr = String(value).replace(/[^0-9.-]+/g, '');
    
    // Check if it's a valid number
    if (isNaN(parseFloat(numStr))) return '';
    
    // Split into integer and decimal parts
    const parts = numStr.split('.');
    
    // Format integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return formatted number (with decimal if it exists)
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
  };