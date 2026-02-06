'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect, useState } from 'react';
import { loadUser, setUser, clearUser } from './slices/authSlice';
import Cookies from 'js-cookie';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Debug: Check localStorage on mount
    console.log('🔄 ReduxProvider mounting...');
    console.log('📦 localStorage check:', {
      hasToken: !!Cookies.get('access_token'),
      hasRefresh: !!Cookies.get('refresh_token'),
      hasUser: !!localStorage.getItem('user'),
    });

    store.dispatch(loadUser());

    const handleAuthRefresh = (event: Event) => {
      const custom = event as CustomEvent<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>;
      if (!custom.detail) return;
      store.dispatch(
        setUser({
          user: custom.detail.user,
          accessToken: custom.detail.accessToken,
          refreshToken: custom.detail.refreshToken,
        })
      );
    };

    const handleAuthClear = () => {
      store.dispatch(clearUser());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:refresh', handleAuthRefresh as EventListener);
      window.addEventListener('auth:clear', handleAuthClear as EventListener);
    }

    const state = store.getState();
    console.log('✅ Redux state after loadUser:', {
      isAuthenticated: state.auth.isAuthenticated,
      isLoaded: state.auth.isLoaded,
      hasUser: !!state.auth.user,
    });

    setIsReady(true);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:refresh', handleAuthRefresh as EventListener);
        window.removeEventListener('auth:clear', handleAuthClear as EventListener);
      }
    };
  }, []);

  // Don't render children until auth state is loaded from localStorage
  if (!isReady) {
    return (
      <Provider store={store}>
        <div className="min-h-screen bg-white dark:bg-gray-900" />
      </Provider>
    );
  }

  return <Provider store={store}>{children}</Provider>;
}
