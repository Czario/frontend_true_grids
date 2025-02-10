import axios from "axios";
interface FormData {
    email: string;
    password: string;
}

interface signupResponse {
  message?: string;
  success: boolean;
}

  export const loginService = async (formData: FormData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: false, message: "Email or Password Mismatch" });
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

export const signUpService = async (formData: FormData) : Promise<signupResponse> => {
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
