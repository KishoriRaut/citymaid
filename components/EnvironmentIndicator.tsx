'use client';

import { getEnvironmentInfo } from '@/lib/env-info';

export function EnvironmentIndicator() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const env = getEnvironmentInfo();
  
  const getEnvColor = (environment: string) => {
    switch (environment) {
      case 'Development':
        return 'bg-blue-500';
      case 'Production':
        return 'bg-red-500';
      case 'Local':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="fixed top-4 left-4 z-50">
      <div className={`${getEnvColor(env.environment)} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
        {env.environment} ({env.projectId})
      </div>
    </div>
  );
}
