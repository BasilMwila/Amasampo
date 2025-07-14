// Create a custom hook for type-safe navigation
// File: hooks/useTypedRouter.ts

import { useRouter } from 'expo-router';

type AppRoutes = 
  | '/(tabs)'
  | '/auth/login'
  | '/auth/register'
  | `/product/${string}`
  | `/chat/${string}`
  | '/payment/methods';

export const useTypedRouter = () => {
  const router = useRouter();
  
  return {
    ...router,
    replace: (route: AppRoutes) => router.replace(route as any),
    push: (route: AppRoutes) => router.push(route as any),
  };
};

// Usage in your components:
// import { useTypedRouter } from '@/hooks/useTypedRouter';
// const router = useTypedRouter();
// router.replace('/(tabs)'); // Now properly typed!