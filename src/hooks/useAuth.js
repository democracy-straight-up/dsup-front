import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, authenticate } from "../store/userSlice";
import { refreshTokens } from "../store/api";
import jwtDecode from "jwt-decode";

export const useAuth = () => {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  const isTokenExpiringSoon = (token, minutesThreshold = 5) => {
    if (!token) return true;
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const thresholdTime = currentTime + minutesThreshold * 60;
      return decodedToken.exp < thresholdTime;
    } catch (error) {
      return true;
    }
  };

  const isAuthenticated = () => {
    if (!AuthUser || !AuthUser.token) {
      return false;
    }

    // If access token is valid, user is authenticated
    if (!isTokenExpired(AuthUser.token.access)) {
      return true;
    }

    // If access token is expired but refresh token is still valid,
    // user is still considered authenticated (we'll refresh automatically)
    if (AuthUser.token.refresh && !isTokenExpired(AuthUser.token.refresh)) {
      return true;
    }

    // Both tokens are expired or invalid
    return false;
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/enter-the-floor");
  };

  const refreshToken = async () => {
    if (!AuthUser?.token?.refresh) {
      console.log("No refresh token available");
      handleLogout();
      return false;
    }

    // if (isTokenExpired(AuthUser.token.refresh)) {
    //   console.log("Refresh token expired, logging out");
    //   handleLogout();
    //   return false;
    // }

    try {
      console.log("Refreshing access token...");
      const newTokenData = await refreshTokens(AuthUser.token.refresh);
      const updatedUser = {
        ...AuthUser,
        token: {
          access: newTokenData.access,
          refresh: newTokenData.refresh || AuthUser.token.refresh,
        },
      };
      dispatch(authenticate(updatedUser));
      console.log("Token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Only logout if refresh actually failed, not just because access token expired
      handleLogout();
      return false;
    }
  };

  const ensureValidToken = async () => {
    if (!AuthUser) {
      return false;
    }

    // If access token is still valid, no need to refresh
    if (!isTokenExpired(AuthUser.token.access)) {
      return true;
    }

    // Access token expired, try to refresh if refresh token is valid
    if (AuthUser.token.refresh && !isTokenExpired(AuthUser.token.refresh)) {
      console.log("Access token expired, attempting refresh...");
      return await refreshToken();
    }

    // Both tokens are expired
    console.log("Both tokens expired, user needs to login again");
    return false;
  };

  return {
    AuthUser,
    isAuthenticated,
    isTokenExpired,
    isTokenExpiringSoon,
    handleLogout,
    refreshToken,
    ensureValidToken,
  };
};
