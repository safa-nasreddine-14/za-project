export const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP || '192.168.43.134';
export const SERVER_PORT = process.env.EXPO_PUBLIC_SERVER_PORT || '3000';
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || `http://${SERVER_IP}:${SERVER_PORT}`;
export const API_URL = `${BASE_URL}/api`;

export const ENDPOINTS = {
    REPORTS: `${API_URL}/reports`,
    VOICE: `${API_URL}/voice`,
    ALARMS: `${API_URL}/alarms`,
};
