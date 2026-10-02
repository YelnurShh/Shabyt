'use client';

import { useAuth } from '@/components/auth-provider';
import { LoadingAnimation } from '@/components/loading-animation';

export function AuthLoadingOverlay() {
  const { loading } = useAuth();
  if (!loading) return null;
  return <div className="site-loading-overlay"><LoadingAnimation /></div>;
}
