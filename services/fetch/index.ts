import axios from "axios";
import { useUserStore } from "@/stores/userStore";
import { RefreshToken } from "@/services/userService";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_API_URL;

// Add request interceptor to include access token
axios.interceptors.request.use(
  (config) => {
    const { tokens } = useUserStore.getState();
    if (tokens?.access_token) {
      config.headers.Authorization = `Bearer ${tokens.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const { tokens, updateTokens, logout } = useUserStore.getState();
      
      if (tokens?.refresh_token) {
        try {
          const response = await RefreshToken(tokens.refresh_token);
          updateTokens(response);
          
          // Update the authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
          
          // Retry the original request
          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout user and redirect to home
          logout();
          window.location.href = '/';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, logout and redirect
        logout();
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;