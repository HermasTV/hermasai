// Simple environment-based configuration
export const CONFIG = {
  PYTHON_SERVICES_URL: process.env.PYTHON_SERVICES_URL || 'http://127.0.0.1:8000',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'hermasai2024'
};

// Helper function to get the Python services URL
export function getPythonServicesUrl(): string {
  return CONFIG.PYTHON_SERVICES_URL;
}

// Helper function to validate admin credentials
export function validateAdminCredentials(username: string, password: string): boolean {
  return username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD;
}