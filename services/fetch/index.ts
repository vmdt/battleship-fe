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
// axios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
    
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       const { tokens, updateTokens } = useUserStore.getState();
      
//       if (tokens?.refresh_token) {
//         try {
//           const response = await RefreshToken(tokens.refresh_token);
//           updateTokens(response.tokens);
//           return axios(originalRequest);
//         } catch (refreshError) {
//           // If refresh fails, logout user
//           useUserStore.getState().logout();
//           return Promise.reject(refreshError);
//         }
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

export default axios;