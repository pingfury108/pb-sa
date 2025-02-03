'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { pb } from '../lib/pocketbase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 检查认证状态
    const isAuthenticated = pb.authStore.isValid;
    const isAuthPage = pathname === '/login';
    console.log('[AuthProvider] Authentication Status:');
    console.log('[AuthProvider] isAuthenticated:', isAuthenticated);
    console.log('[AuthProvider] isAuthPage:', isAuthPage);
    console.log('[AuthProvider] Current URL:', pathname);

    if (!isAuthenticated && !isAuthPage) {
      router.replace('/login');
    }

    if (isAuthenticated && isAuthPage) {
      router.replace('/');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
