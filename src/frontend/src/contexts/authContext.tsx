import {
  LANGFLOW_ACCESS_TOKEN,
  LANGFLOW_API_TOKEN,
  LANGFLOW_AUTO_LOGIN_OPTION,
} from "@/constants/constants";
import { useGetCheckApiKeysQuery } from "@/controllers/API/queries/store";
import useAuthStore from "@/stores/authStore";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { getLoggedUser, requestLogout } from "../controllers/API";
import useAlertStore from "../stores/alertStore";
import { useFolderStore } from "../stores/foldersStore";
import { useStoreStore } from "../stores/storeStore";
import { Users } from "../types/api";
import { AuthContextType } from "../types/contexts/auth";

const initialValue: AuthContextType = {
  accessToken: null,
  login: () => {},
  userData: null,
  setUserData: () => {},
  authenticationErrorCount: 0,
  setApiKey: () => {},
  apiKey: null,
  storeApiKey: () => {},
  getUser: () => {},
};

export const AuthContext = createContext<AuthContextType>(initialValue);

export function AuthProvider({ children }): React.ReactElement {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const [accessToken, setAccessToken] = useState<string | null>(
    cookies.get(LANGFLOW_ACCESS_TOKEN) ?? null,
  );
  const [userData, setUserData] = useState<Users | null>(null);
  const setLoading = useAlertStore((state) => state.setLoading);
  const [apiKey, setApiKey] = useState<string | null>(
    cookies.get(LANGFLOW_API_TOKEN),
  );

  const getFoldersApi = useFolderStore((state) => state.getFoldersApi);

  const checkHasStore = useStoreStore((state) => state.checkHasStore);
  const setAllFlows = useFlowsManagerStore((state) => state.setAllFlows);
  const setSelectedFolder = useFolderStore((state) => state.setSelectedFolder);
  const { refetch: fetchApiData } = useGetCheckApiKeysQuery();
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  const setIsAdmin = useAuthStore((state) => state.setIsAdmin);
  const setIsLoading = useFlowsManagerStore((state) => state.setIsLoading);
  const autoLogin = useAuthStore((state) => state.autoLogin);

  useEffect(() => {
    const storedAccessToken = cookies.get(LANGFLOW_ACCESS_TOKEN);
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }
  }, []);

  useEffect(() => {
    const apiKey = cookies.get(LANGFLOW_API_TOKEN);
    if (apiKey) {
      setApiKey(apiKey);
    }
  }, []);

  function getUser() {
    getLoggedUser()
      .then(async (user) => {
        setUserData(user);
        const isSuperUser = user!.is_superuser;
        useAuthStore.getState().setIsAdmin(isSuperUser);
        getFoldersApi(true, true);

        checkHasStore();
        fetchApiData();
      })
      .catch((error) => {
        setLoading(false);
      });
  }

  function login(newAccessToken: string, autoLogin: string) {
    cookies.set(LANGFLOW_AUTO_LOGIN_OPTION, autoLogin, { path: "/" });
    setAccessToken(newAccessToken);
    setIsAuthenticated(true);
    getUser();
  }

  function storeApiKey(apikey: string) {
    setApiKey(apikey);
  }

  return (
    // !! to convert string to boolean
    <AuthContext.Provider
      value={{
        accessToken,
        login,
        setUserData,
        userData,
        authenticationErrorCount: 0,
        setApiKey,
        apiKey,
        storeApiKey,
        getUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
