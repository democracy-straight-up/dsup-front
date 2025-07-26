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

  const isAuthenticated = () => {
    return AuthUser && AuthUser.token && !isTokenExpired(AuthUser.token.access);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/enter-the-floor");
  };

  const refreshToken = async () => {
    if (!AuthUser?.token?.refresh) {
      handleLogout();
      return false;
    }

    if (isTokenExpired(AuthUser.token.refresh)) {
      handleLogout();
      return false;
    }

    try {
      const newTokenData = await refreshTokens(AuthUser.token.refresh);
      const updatedUser = {
        ...AuthUser,
        token: {
          access: newTokenData.access,
          refresh: newTokenData.refresh || AuthUser.token.refresh,
        },
      };
      dispatch(authenticate(updatedUser));
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      handleLogout();
      return false;
    }
  };

  const ensureValidToken = async () => {
    if (!AuthUser) {
      return false;
    }

    if (isTokenExpired(AuthUser.token.access)) {
      return await refreshToken();
    }

    return true;
  };

  return {
    AuthUser,
    isAuthenticated,
    isTokenExpired,
    handleLogout,
    refreshToken,
    ensureValidToken,
  };
};
