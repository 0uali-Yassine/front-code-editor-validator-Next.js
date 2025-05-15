import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { UserType } from '../types';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth check function
  useEffect(() => {
    // Define public paths
    const publicPaths = ['/', '/signup'];
    
    const checkAuth = () => {
      // Skip auth check on public paths
      if (publicPaths.includes(router.pathname)) {
        setIsLoading(false);
        setAuthChecked(true);
        return;
      }
      
      if (typeof window !== 'undefined') {
        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        
        if (userStr) {
          try {
            const userData = JSON.parse(userStr) as UserType;
            setUser(userData);
            setIsAuthenticated(true);
            
            // Check role-specific routes
            if (router.pathname === '/manager-dashboard' && userData.role !== 'manager') {
              router.push('/unauthorized');
            } else if ((router.pathname === '/home' || router.pathname === '/classroom') && userData.role !== 'student') {
              router.push('/unauthorized');
            }
          } catch (error) {
            console.error('Auth error:', error);
            clearAuth();
          }
        } else {
          // User not found in localStorage
          clearAuth();
        }
        
        setIsLoading(false);
        setAuthChecked(true);
      }
    };
    
    const clearAuth = () => {
      setIsAuthenticated(false);
      setUser(null);
      if (!publicPaths.includes(router.pathname)) {
        router.push('/');
      }
    };
    
    checkAuth();
  }, [router.pathname, router]); // Include router in dependencies

  // Handle loading state
  if (!authChecked || (isLoading && typeof window !== 'undefined')) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <Component {...pageProps} />;
}

export default MyApp;

