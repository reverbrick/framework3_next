// Define public routes that don't require authentication
export const publicRoutes = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/callback',
  '/auth/reset-password',
  '/auth/verify',
  '/auth/forgot-password',
] as const;

// Define auth routes that should redirect to dashboard if user is logged in
export const authRoutesToRedirect = [
  '/auth/sign-in',
  '/auth/sign-up',
] as const;

// Type for public routes
export type PublicRoute = typeof publicRoutes[number];

// Type for auth routes to redirect
export type AuthRouteToRedirect = typeof authRoutesToRedirect[number];

// Helper function to check if a route is public
export function isPublicRoute(pathname: string): boolean {
  // Remove trailing slash if present
  const normalizedPath = pathname.replace(/\/$/, '');
  
  // Debug logging
  console.log('Checking public route:', {
    normalizedPath,
    publicRoutes,
    matches: publicRoutes.some(route => normalizedPath === route)
  });
  
  // Check for exact match
  return publicRoutes.some(route => normalizedPath === route);
}

// Helper function to check if a route should redirect when logged in
export function shouldRedirectWhenLoggedIn(pathname: string): boolean {
  // Remove trailing slash if present
  const normalizedPath = pathname.replace(/\/$/, '');
  
  // Debug logging
  console.log('Checking auth redirect:', {
    normalizedPath,
    authRoutesToRedirect,
    matches: authRoutesToRedirect.some(route => normalizedPath === route)
  });
  
  // Check for exact match
  return authRoutesToRedirect.some(route => normalizedPath === route);
} 