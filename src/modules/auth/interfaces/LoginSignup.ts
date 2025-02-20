export interface LoginForm {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    success: boolean;
    message?: string;
    firstName?: string;
    lastName?: string;
  }
  

  export interface SignupForm {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface SignupResponse {
    success: boolean;
    message?: string;
  }