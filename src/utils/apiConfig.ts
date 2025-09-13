// API Configuration utility
export const API_CONFIG = {
  PDF_CONVERTER: {
    BASE_URL: process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL ||
              process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL_DEV ||
              'http://127.0.0.1:8000',

    ENDPOINTS: {
      CONVERT_PDF_TO_DOCX: '/convert/pdf-to-docx',
      HEALTH: '/health',
      DOCS: '/docs'
    }
  }
};

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  const baseUrl = API_CONFIG.PDF_CONVERTER.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

// Environment detection
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}