import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setChainOfDelegation } from "../store/userSlice";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

/**
 * Custom hook to fetch and manage chain of delegation
 * Automatically fetches chain when user is authenticated and doesn't have chain data
 */
export const useChainOfDelegation = () => {
  const AuthUser = useSelector((state) => state.AuthUser.user);
  const chainOfDelegation = useSelector((state) => state.AuthUser.chainOfDelegation);
  const dispatch = useDispatch();
  const { makeRequest } = useAuthenticatedFetch();

  const fetchChainOfDelegation = async () => {
    try {
      const response = await makeRequest(`/api/chain-of-delegation/`);

      if (response.ok) {
        const data = await response.json();
        console.log("Chain of delegation fetched:", data);
        dispatch(setChainOfDelegation(data));
        return data;
      } else {
        console.error("Failed to fetch chain of delegation");
        return null;
      }
    } catch (error) {
      console.error("Error fetching chain of delegation:", error);
      return null;
    }
  };

  useEffect(() => {
    // Only fetch if user is authenticated, doesn't have userType U0D0, and chain isn't already loaded
    if (AuthUser?.username && AuthUser?.users?.userType !== "U0D0" && !chainOfDelegation) {
      fetchChainOfDelegation();
    }
  }, [AuthUser?.username, AuthUser?.users?.userType, chainOfDelegation]);

  return {
    chainOfDelegation,
    fetchChainOfDelegation,
    isFDel: chainOfDelegation?.f_del?.id === AuthUser?.id,
    isSDel: chainOfDelegation?.sec_del?.id === AuthUser?.id,
    isModa: chainOfDelegation?.moda?.id === AuthUser?.id,
    isHolc: chainOfDelegation?.holc?.id === AuthUser?.id,
    isHouseRep: chainOfDelegation?.house_rep?.id === AuthUser?.id,
  };
};
