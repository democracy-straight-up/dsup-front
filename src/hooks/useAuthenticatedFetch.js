import { useAuth } from "./useAuth";
import { authenticatedFetch } from "../store/api";

/**
 * Custom hook for making authenticated API requests with automatic token refresh
 */
export const useAuthenticatedFetch = () => {
  const { AuthUser, ensureValidToken, handleLogout } = useAuth();

  const makeRequest = async (endpoint, options = {}) => {
    // Ensure we have a valid token before making the request
    const hasValidToken = await ensureValidToken();

    if (!hasValidToken) {
      throw new Error("Authentication required");
    }

    // Make the request with automatic token refresh callback
    return authenticatedFetch(endpoint, options, AuthUser, (newTokenData) => {
      // This callback is triggered if token refresh happens during the request
      console.log("Token refreshed during API call");
    });
  };

  return {
    makeRequest,
    AuthUser,
  };
};
