// API Configuration utility
export const API_CONFIG = {
  PDF_CONVERTER: {
    ENDPOINTS: {
      CONVERT_PDF_TO_DOCX: '/convert/pdf-to-docx',
      DEBUG_RESUME: '/debug-resume',
      HEALTH: '/health',
      DOCS: '/docs'
    }
  }
};

// Cache for configuration to avoid repeated API calls
let configCache: { pdfConverterUrl: string } | null = null;
let configCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to get base URL dynamically from server-side config API
async function getBaseUrl(): Promise<string> {
  const now = Date.now();

  // Return cached config if still valid
  if (configCache && (now - configCacheTime) < CACHE_DURATION) {
    return configCache.pdfConverterUrl;
  }

  try {
    // Fetch dynamic configuration from our API endpoint
    const response = await fetch('/api/config', { cache: 'no-store' });
    if (response.ok) {
      const config = await response.json();
      configCache = config;
      configCacheTime = now;
      return config.pdfConverterUrl;
    }
  } catch (error) {
    console.warn('Failed to fetch dynamic config, using fallback:', error);
  }

  // Fallback to build-time environment variables
  const fallbackUrl = process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL ||
                     process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL_DEV ||
                     'http://127.0.0.1:8000';

  // Cache the fallback
  configCache = { pdfConverterUrl: fallbackUrl };
  configCacheTime = now;

  return fallbackUrl;
}

// Helper function to get full API URL (now dynamic and async)
export async function getApiUrl(endpoint: string): Promise<string> {
  const baseUrl = (await getBaseUrl()).replace(/\/$/, ''); // Remove trailing slash

  // Ensure baseUrl has protocol if it's an IP or domain without protocol
  let finalBaseUrl = baseUrl;
  if (!finalBaseUrl.startsWith('http://') && !finalBaseUrl.startsWith('https://')) {
    finalBaseUrl = `http://${finalBaseUrl}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${finalBaseUrl}${cleanEndpoint}`;
}

// Synchronous version for backwards compatibility (uses cached value or fallback)
export function getApiUrlSync(endpoint: string): string {
  const baseUrl = configCache?.pdfConverterUrl ||
                  process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL ||
                  process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL_DEV ||
                  'http://127.0.0.1:8000';

  let finalBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash

  // Ensure baseUrl has protocol if it's an IP or domain without protocol
  if (!finalBaseUrl.startsWith('http://') && !finalBaseUrl.startsWith('https://')) {
    finalBaseUrl = `http://${finalBaseUrl}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${finalBaseUrl}${cleanEndpoint}`;
}

// Function to preload configuration (call on app initialization)
export async function preloadConfig(): Promise<void> {
  try {
    await getBaseUrl(); // This will populate the cache
    console.log('API configuration preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload API configuration:', error);
  }
}

// Environment detection
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}