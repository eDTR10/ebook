import axios from '../plugin/axios';

/**
 * Submit QR code data to attendance endpoint
 * @param qrData - QR code data in JSON format
 * @returns Promise with the response data
 */
export const submitQrAttendance = async (qrData: any) => {
  try {
    const response = await axios.post('/qr/all/', qrData);
    return response.data;
  } catch (error) {
    console.error('Error submitting QR attendance:', error);
    throw error;
  }
};