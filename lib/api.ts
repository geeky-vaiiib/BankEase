import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Type definitions
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface User {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

interface LoginCredentials {
  phone: string;
  pin: string;
}

interface RegisterData {
  name: string;
  phone: string;
  pin: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface TransactionData {
  recipientPhone: string;
  amount: number;
  description?: string;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  recipientPhone?: string;
  senderPhone?: string;
  description?: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Balance {
  amount: number;
  currency: string;
}

interface RequestOptions {
  retries?: number;
  retryDelay?: number;
}

export class ApiError extends Error {
  public status: number;
  public data: any;
  public type: 'network' | 'timeout' | 'auth' | 'server' | 'offline' | 'unknown';

  constructor(message: string, status: number = 0, data: any = null, type: ApiError['type'] = 'unknown') {
    super(message);
    this.status = status;
    this.data = data;
    this.type = type;
    this.name = 'ApiError';
  }
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('bankease-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    // Network error or timeout
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new ApiError('Request timeout. Please try again.', 0, null, 'timeout');
      }
      if (error.code === 'ERR_NETWORK') {
        throw new ApiError('Network error. Please check your connection.', 0, null, 'network');
      }
      throw new ApiError('Network error or server is unreachable', 0, null, 'network');
    }

    // Server responded with error status
    const { status, data } = error.response;
    const message = data?.message || data?.error || error.message || 'An error occurred';

    // Handle authentication errors
    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bankease-token');
        // Don't redirect here, let the component handle it
      }
      throw new ApiError(message, status, data, 'auth');
    }

    throw new ApiError(message, status, data, 'server');
  }
);

class ApiService {
  // Utility methods
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('bankease-token');
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('bankease-token', token);
  }

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('bankease-token');
  }

  logout(): void {
    this.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  }

  // Network status check
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  // Generic request method with retry logic
  async request<T = any>(
    method: 'get' | 'post' | 'put' | 'delete', 
    url: string, 
    data: any = null, 
    options: RequestOptions = {}
  ): Promise<T> {
    const { retries = 1, retryDelay = 500 } = options;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        let response: AxiosResponse<T>;
        
        switch (method.toLowerCase()) {
          case 'get':
            response = await apiClient.get(url);
            break;
          case 'post':
            response = await apiClient.post(url, data);
            break;
          case 'put':
            response = await apiClient.put(url, data);
            break;
          case 'delete':
            response = await apiClient.delete(url);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        return response.data;
      } catch (error) {
        // Only retry on network errors, not on server errors
        if (
          attempt < retries && 
          error instanceof ApiError &&
          (error.type === 'network' || error.type === 'timeout')
        ) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
        throw error;
      }
    }
    
    // This should never be reached, but TypeScript requires it
    throw new Error('Request failed after all retries');
  }

  // Authentication methods
  async register(userData: RegisterData): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await this.request<ApiResponse<LoginResponse>>('post', '/auth/register', userData);
      if (response.success && response.data?.token) {
        this.setToken(response.data.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      // Check if online first
      if (!this.isOnline()) {
        throw new ApiError('You are offline. Please check your internet connection.', 0, null, 'offline');
      }

      const response = await this.request<ApiResponse<LoginResponse>>('post', '/auth/login', credentials, { 
        retries: 2, 
        retryDelay: 500 
      });
      
      if (response.success && response.data?.token) {
        this.setToken(response.data.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(): Promise<ApiResponse<User>> {
    try {
      return await this.request<ApiResponse<User>>('get', '/auth/verify');
    } catch (error) {
      this.removeToken();
      throw error;
    }
  }

  // Transaction methods
  async getBalance(): Promise<ApiResponse<Balance>> {
    return await this.request<ApiResponse<Balance>>('get', '/transactions/balance');
  }

  async sendMoney(transactionData: TransactionData): Promise<ApiResponse<Transaction>> {
    return await this.request<ApiResponse<Transaction>>('post', '/transactions/send', transactionData);
  }

  async getTransactionHistory(page: number = 1, limit: number = 10): Promise<ApiResponse<{ transactions: Transaction[], total: number, page: number, limit: number }>> {
    return await this.request('get', `/transactions/history?page=${page}&limit=${limit}`);
  }

  async getRecentTransactions(): Promise<ApiResponse<Transaction[]>> {
    return await this.request<ApiResponse<Transaction[]>>('get', '/transactions/recent');
  }

  async getTransactionDetails(transactionId: string): Promise<ApiResponse<Transaction>> {
    return await this.request<ApiResponse<Transaction>>('get', `/transactions/${transactionId}`);
  }
}

// Create and export API service instance
const api = new ApiService();

// Export types for use in components
export type {
  ApiResponse,
  User,
  LoginCredentials,
  RegisterData,
  LoginResponse,
  TransactionData,
  Transaction,
  Balance,
  RequestOptions
};

// Export both the class and instance for different use cases
export { ApiService, apiClient, api };
export default api;
