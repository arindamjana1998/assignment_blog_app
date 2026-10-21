import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';

import toast from 'react-hot-toast';
import authService from '../services/authService';
import userService from '../services/userService';
import { setAuthToken, setOnUnauthenticated } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear session state cleanly
  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setAuthToken(null);
  }, []);

  // Initialize session on application load via silent refresh
  useEffect(() => {
    let isMounted = true;

    // Register callback for when refresh token fails permanently in Axios interceptor
    setOnUnauthenticated(() => {
      clearSession();
    });

    const bootstrapAuth = async () => {
      try {
        const response = await authService.refreshToken();
        if (isMounted && response?.data) {
          const { user: refreshedUser, accessToken: newAccessToken } = response.data;
          setAuthToken(newAccessToken);
          setUser(refreshedUser);
          setAccessToken(newAccessToken);
        }
      } catch (err) {
        // Guest user or no cookie exists; gracefully set unauthenticated
        clearSession();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  /**
   * Login with email and password
   */
  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { user: loggedInUser, accessToken: token } = response.data;

      setAuthToken(token);
      setUser(loggedInUser);
      setAccessToken(token);

      toast.success(`Welcome back, ${loggedInUser.name}!`, { id: 'auth-login' });
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message, { id: 'auth-login' });
      throw error;
    }
  }, []);

  /**
   * Register a new user
   */
  const register = useCallback(async (userData) => {
    try {
      const response = await authService.register(userData);
      toast.success('Registration successful! Please log in to continue.', { id: 'auth-register' });
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message, { id: 'auth-register' });
      throw error;
    }
  }, []);

  /**
   * Logout user and clear tokens
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout({ email: user?.email });
    } catch (error) {
      // Ignore backend logout errors and clear client state anyway
    } finally {
      clearSession();
      toast.success('Logged out successfully', { id: 'auth-logout' });
    }
  }, [user?.email, clearSession]);

// Singleton cache to deduplicate concurrent OAuth token processing across mounts/renders
let activeOAuthPromise = null;
let lastProcessedOAuthToken = null;

  /**
   * Ingest OAuth token received from callback URL
   */
  const handleOAuthToken = useCallback(
    async (token) => {
      if (!token) return null;

      // If token has already been processed and user is established, reuse user
      if (lastProcessedOAuthToken === token && user) {
        return user;
      }

      // If an in-flight request is already querying /auth/me for this token, return the active promise
      if (activeOAuthPromise && lastProcessedOAuthToken === token) {
        return activeOAuthPromise;
      }

      lastProcessedOAuthToken = token;
      activeOAuthPromise = (async () => {
        try {
          setIsLoading(true);
          setAuthToken(token);
          setAccessToken(token);

          const meResponse = await authService.getMe();
          const currentUser = meResponse.data.user;

          setUser(currentUser);
          toast.success(`Signed in via OAuth as ${currentUser.name}`, { id: 'oauth-signin' });
          return currentUser;
        } catch (error) {
          clearSession();
          lastProcessedOAuthToken = null;
          const message = getErrorMessage(error);
          toast.error(message, { id: 'oauth-signin' });
          throw error;
        } finally {
          setIsLoading(false);
          activeOAuthPromise = null;
        }
      })();

      return activeOAuthPromise;
    },
    [user, clearSession]
  );


  /**
   * Update authenticated user's profile
   */
  const updateProfile = useCallback(async (updateData) => {
    try {
      const response = await userService.updateProfile(updateData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      toast.success('Profile updated successfully', { id: 'user-profile' });
      return updatedUser;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message, { id: 'user-profile' });
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isAdmin: user?.role === 'admin',
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      handleOAuthToken,
    }),
    [user, accessToken, isLoading, login, register, logout, updateProfile, handleOAuthToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

