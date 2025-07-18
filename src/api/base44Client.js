import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "687862b8ebd7f1123e8c7489", 
  requiresAuth: true // Ensure authentication is required for all operations
});
