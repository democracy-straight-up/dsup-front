import { baseURL } from "./conf.js";

/**
 * Makes an authenticated API request with automatic token handling
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @param {Object} authUser - User object containing token information
 * @returns {Promise<Response>} - Fetch response
 */
export const authenticatedFetch = async (endpoint, options = {}, authUser = null) => {
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

    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      console.error("Authentication required or token expired");
      // You could implement token refresh logic here
      // or redirect to login page
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
