import { baseURL } from "./conf";

/**
 * Makes an authenticated API request with automatic token handling
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @param {Object} authUser - User object containing token information
 * @param {Function} onTokenRefresh - Callback function to handle token refresh
 * @returns {Promise<Response>} - Fetch response
 */
export const authenticatedFetch = async (
  endpoint,
  options = {},
  authUser = null,
  onTokenRefresh = null
) => {
  const url = `${window.location.protocol}//${baseURL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if authUser has a token
  if (authUser?.token?.access) {
    defaultHeaders["Authorization"] = `Bearer ${authUser.token.access}`;
  }

  const fetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Handle 401 Unauthorized responses with automatic token refresh
    if (response.status === 401 && authUser?.token?.refresh && onTokenRefresh) {
      console.log("Access token expired, attempting to refresh...");

      try {
        const newTokenData = await refreshTokens(authUser.token.refresh);

        // Call the token refresh callback to update the auth state
        if (onTokenRefresh) {
          onTokenRefresh(newTokenData);
        }

        // Retry the original request with the new token
        const retryHeaders = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${newTokenData.access}`,
        };

        return await fetch(url, {
          ...fetchOptions,
          headers: retryHeaders,
        });
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        throw new Error("Authentication failed");
      }
    }

    return response;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

/**
 * Utility function for refreshing JWT tokens
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} - New token data
 */
export const refreshTokens = async (refreshToken) => {
  try {
    const response = await fetch(`${window.location.protocol}//${baseURL}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};
