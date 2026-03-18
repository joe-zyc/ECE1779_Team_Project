import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiRequest, authApi } from "../api/client";

const STORAGE_KEY = "openmotor_auth";

const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredAuth(next) {
  if (!next) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const cached = readStoredAuth();
    return {
      accessToken: cached?.accessToken || "",
      refreshToken: cached?.refreshToken || "",
      user: cached?.user || null,
      ready: false,
    };
  });

  const setSession = useCallback((next) => {
    setAuthState((current) => {
      const updated = {
        ...current,
        ...next,
      };

      writeStoredAuth({
        accessToken: updated.accessToken,
        refreshToken: updated.refreshToken,
        user: updated.user,
      });

      return updated;
    });
  }, []);

  const clearSession = useCallback(() => {
    writeStoredAuth(null);
    setAuthState({
      accessToken: "",
      refreshToken: "",
      user: null,
      ready: true,
    });
  }, []);

  const fetchMe = useCallback(async (token) => {
    const response = await authApi.me(token);
    return response.data;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!authState.accessToken) {
        if (!cancelled) {
          setAuthState((current) => ({ ...current, ready: true }));
        }
        return;
      }

      try {
        const user = await fetchMe(authState.accessToken);
        if (!cancelled) {
          setSession({ user, ready: true });
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [authState.accessToken, clearSession, fetchMe, setSession]);

  const signup = useCallback((payload) => authApi.signup(payload), []);

  const login = useCallback(
    async (payload) => {
      const response = await authApi.login(payload);
      const nextSession = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        user: response.data.user,
        ready: true,
      };
      setSession(nextSession);
      return response.data.user;
    },
    [setSession]
  );

  const refresh = useCallback(async () => {
    if (!authState.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await authApi.refresh(authState.refreshToken);
    const newAccessToken = response.data.access_token;
    const user = await fetchMe(newAccessToken);

    setSession({
      accessToken: newAccessToken,
      user,
      ready: true,
    });

    return newAccessToken;
  }, [authState.refreshToken, fetchMe, setSession]);

  const requestWithAuth = useCallback(
    async (path, options = {}) => {
      if (!authState.accessToken) {
        const error = new Error("You must be signed in to continue.");
        error.status = 401;
        throw error;
      }

      try {
        return await apiRequest(path, {
          ...options,
          token: authState.accessToken,
        });
      } catch (error) {
        const shouldRetry = error.status === 401 && authState.refreshToken;

        if (!shouldRetry) {
          throw error;
        }

        try {
          const newAccessToken = await refresh();
          return await apiRequest(path, {
            ...options,
            token: newAccessToken,
          });
        } catch (refreshError) {
          clearSession();
          throw refreshError;
        }
      }
    },
    [authState.accessToken, authState.refreshToken, clearSession, refresh]
  );

  const logout = useCallback(async () => {
    try {
      if (authState.accessToken) {
        await authApi.logout(authState.accessToken);
      }
    } finally {
      clearSession();
    }
  }, [authState.accessToken, clearSession]);

  const value = useMemo(
    () => ({
      ...authState,
      isAuthenticated: Boolean(authState.accessToken),
      role: authState.user?.role || null,
      signup,
      login,
      logout,
      refresh,
      requestWithAuth,
      setSession,
    }),
    [authState, login, logout, refresh, requestWithAuth, setSession, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
