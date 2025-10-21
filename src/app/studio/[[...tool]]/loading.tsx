'use client';

import config from '../../../../sanity.config';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg">Loading {config.title}...</p>
      </div>
    </div>
  );
}
