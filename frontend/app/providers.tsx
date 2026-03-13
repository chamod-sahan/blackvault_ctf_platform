'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { initSocket, joinUserRoom } from '@/lib/socket';

import { NotificationProvider } from './components/NotificationProvider';
import CommandSearch from './components/CommandSearch';

export function Providers({ children }: { children: ReactNode }) {
  const { setUser, setLoading, user } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await authApi.me();
        setUser(data.user);
        const socket = initSocket();
        if (socket && data.user) {
          joinUserRoom(data.user.id);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setLoading]);

  return (
    <>
      <NotificationProvider />
      <CommandSearch />
      {children}
    </>
  );
}
