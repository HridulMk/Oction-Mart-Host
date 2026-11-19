import { profile } from 'console';
import api from '../index';
import { User } from './user';

export interface LoginRequest {
  username: string;
  password: string;
  user_type: 'buyer' | 'seller' | 'auctioneer' | 'admin';
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user_type: 'buyer' | 'seller' | 'auctioneer' | 'admin';
  user: {
    id: string;
    username: string;
    user_type: 'buyer' | 'seller' | 'auctioneer' | 'admin';
    name?: string;
    email?: string;
    approval_status?: string;
    profile_pic?: File | string;
  };
}

export interface RegisterRequest {
  user_type: 'buyer' | 'seller' | 'auctioneer';
  username: string;
  email: string;
  password: string;
  // Buyer specific fields
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Seller specific fields
  companyName?: string;
  businessType?: string;
  bankAccount?: string;
  taxId?: string;
  // Auctioneer specific fields
  business_name?: string;
  contactNumber: string;
  business_category?: string;
  licenseNumber?: string;
  licenseIssueDate?: string;
  licenseDocument?: File;
}

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login/', credentials);
    
    // Map backend response to frontend format
    const backendData = response.data;
    const loginResponse: LoginResponse = {
      access: backendData.access,
      refresh: backendData.refresh,
      user_type: backendData.user.user_type as 'buyer' | 'seller' | 'auctioneer' | 'admin',
      user: {
        id: backendData.user.id.toString(),
        username: backendData.user.username,
        user_type: backendData.user.user_type as 'buyer' | 'seller' | 'auctioneer' | 'admin',
        name: backendData.user.username,
        email: backendData.user.email,
        approval_status: backendData.user.approval_status,
        profile_pic: backendData.user.profile_pic || ''
      }
    };

    // Store tokens in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', loginResponse.access);
      localStorage.setItem('refreshToken', loginResponse.refresh);
      localStorage.setItem('user', JSON.stringify(loginResponse.user));
    }

    return loginResponse;
  },

  // Register user
  async register(userData: RegisterRequest): Promise<{ message: string; user: unknown }> {
    const formData = new FormData();
    // Common fields
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('password_confirm', userData.password);
    formData.append('phone_number', userData.contactNumber || '');

    // Buyer required fields
    if (userData.user_type === 'buyer') {
      formData.append('first_name', userData.firstName || '');
      formData.append('last_name', userData.lastName || '');
      formData.append('date_of_birth', userData.dateOfBirth || '');
      formData.append('residence_address', userData.address || '');
      formData.append('street_address', userData.streetAddress || '');
      formData.append('city', userData.city || '');
      formData.append('state_province', userData.state || '');
      formData.append('zip_code', userData.zipCode || '');
    }

    // Seller required fields
    if (userData.user_type === 'seller') {
      formData.append('company_name', userData.companyName || '');
      formData.append('residence_address', userData.address || '');
      formData.append('street_address', userData.streetAddress || '');
      formData.append('city', userData.city || '');
      formData.append('state_province', userData.state || '');
      formData.append('zip_code', userData.zipCode || '');
      formData.append('business_type', userData.businessType || '');
      formData.append('tax_id', userData.taxId || '');
      formData.append('bank_account_number', userData.bankAccount || '');
    }

    // Auctioneer required fields
    if (userData.user_type === 'auctioneer') {
      formData.append('business_name', userData.business_name || '');
      formData.append('residence_address', userData.address || '');
      formData.append('street_address', userData.streetAddress || '');
      formData.append('city', userData.city || '');
      formData.append('state_province', userData.state || '');
      formData.append('zip_code', userData.zipCode || '');
      formData.append('business_category', userData.business_category || '');
      formData.append('bank_account_number', userData.bankAccount || '');
      formData.append('license_number', userData.licenseNumber || '');
      formData.append('license_issue_date', userData.licenseIssueDate || '');
      if (userData.licenseDocument instanceof File) {
        formData.append('license_document', userData.licenseDocument);
      }
    }

    // Use correct endpoint
    let endpoint = '/auth/register/buyer/';
    if (userData.user_type === 'seller') endpoint = '/auth/register/seller/';
    if (userData.user_type === 'auctioneer') endpoint = '/auth/register/auctioneer/';

    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile/');
    return {
      id: response.data.id.toString(),
      username: response.data.username,
      user_type: response.data.user_type as 'buyer' | 'seller' | 'auctioneer' | 'admin',
      name: response.data.username,
      email: response.data.email,
      approval_status: response.data.approval_status,
      profile_pic: response.data.profile_pic || ''
    };
  },

  // Refresh token
  async refreshToken(): Promise<{ access: string; refresh?: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response =await api.post('/auth/login/refresh/', { refresh: refreshToken });
    const { access, refresh } = response.data;

    // Update localStorage with new tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', access);
      if (refresh) {
        localStorage.setItem('refreshToken', refresh); // Update if new refresh token is provided
      }
    }

    return { access, refresh };
  },
};