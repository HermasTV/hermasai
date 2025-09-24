"use client";

import { useEffect } from 'react';
import { preloadConfig } from '@/utils/apiConfig';

export function ConfigInitializer() {
  useEffect(() => {
    // Preload API configuration on app start
    preloadConfig();
  }, []);

  return null; // This component doesn't render anything
}