'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect, useState } from 'react';
import { loadUser } from './slices/authSlice';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Debug: Check localStorage on mount
    console.log('🔄 ReduxProvider mounting...');
    console.log('📦 localStorage check:', {
      hasToken: !!localStorage.getItem('access_token'),
      hasRefresh: !!localStorage.getItem('refresh_token'),
      hasUser: !!localStorage.getItem('user'),
    });
    
    store.dispatch(loadUser());
    

    const state = store.getState();
    console.log('✅ Redux state after loadUser:', {
      isAuthenticated: state.auth.isAuthenticated,
      isLoaded: state.auth.isLoaded,
      hasUser: !!state.auth.user,
    });
    
    setIsReady(true);
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
