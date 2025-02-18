import axios from "axios";
import { LoginForm, LoginResponse } from "@/modules/auth/interfaces/Login";
import { signupForm, signupResponse } from "@/modules/auth/interfaces/Signup";

export const loginService = async (formData: LoginForm): Promise<LoginResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: "Email or Password Mismatch" });
        }, 2000);
    });
    // try {
    //   const response = await axios.post("/api/auth/login", formData);
    //   return response.data;
    // } catch (error) {
    //   console.error("Signup failed:", error);
    //   throw error;
    // }
};

export const signUpService = async (formData: signupForm): Promise<signupResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: "email id already exists" });
        }, 2000);
    });
    // try {
    //   const response = await axios.post("/api/auth/register", formData);
    //   return response.data;
    // } catch (error) {
    //   console.error("Signup failed:", error);
    //   throw error;
    // }
};