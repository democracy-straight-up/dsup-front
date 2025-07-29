import { useEffect } from "react";
import { useAuth } from "./useAuth";

/**
 * Hook to track user activity and refresh tokens when user is active
 */
export const useActivityTracker = () => {
  const { AuthUser, isTokenExpiringSoon, refreshToken } = useAuth();

  useEffect(() => {
    if (!AuthUser) return;

    const activityEvents = ["mousedown", "keypress", "scroll", "touchstart", "click"];
    let activityTimeout;

    const handleActivity = async () => {
      // Clear existing timeout
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }

      // Check if token needs refresh due to activity
      if (AuthUser?.token?.access && isTokenExpiringSoon(AuthUser.token.access, 10)) {
        console.log("User activity detected, refreshing token...");
        await refreshToken();
      }

      // Set timeout for next check (5 minutes)
      activityTimeout = setTimeout(() => {
        if (AuthUser?.token?.access && isTokenExpiringSoon(AuthUser.token.access, 5)) {
          refreshToken();
        }
      }, 5 * 60 * 1000); // 5 minutes
    };

    // Add event listeners for activity
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial check
    handleActivity();

    // Cleanup
    return () => {
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [AuthUser, isTokenExpiringSoon, refreshToken]);
};
