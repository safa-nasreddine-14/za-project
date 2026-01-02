export const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP || 'za-project-ouj7.onrender.com';
export const SERVER_PORT = process.env.EXPO_PUBLIC_SERVER_PORT || '443';
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || `https://${SERVER_IP}`;
export const API_URL = `${BASE_URL}/api`;

export const ENDPOINTS = {
    REPORTS: `${API_URL}/reports`,
    VOICE: `${API_URL}/voice`,
    ALARMS: `${API_URL}/alarms`,
};
