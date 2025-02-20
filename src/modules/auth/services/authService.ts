import axios from 'axios';
import { LoginForm, LoginResponse, SignupForm, SignupResponse } from '../interfaces/LoginSignup';

const API_URL = 'http://127.0.0.1:3001'; // Replace with your backend API URL



export const loginService = async (formData: LoginForm): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, formData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: (error as any).response?.data?.message || 'Login failed',
    };
  }
};

export const signupService = async (formData: SignupForm): Promise<SignupResponse> => {
  try {
    const response = await axios.post(`${API_URL}/users`, formData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: (error as any).response?.data?.message || 'Signup failed',
    };
  }
};

export const googleLoginService = async (): Promise<LoginResponse> => {
  try {
    const response = await axios.get(`${API_URL}/auth/google`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: (error as any).response?.data?.message || 'Google login failed',
    };
  }
};

export const logoutService = () => {
    document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

