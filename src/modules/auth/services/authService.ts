interface FormData {
    email: string;
    password: string;
  }

export const loginService = async (formData: FormData) => {
    await fetch('/api/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
};

export const signUpService = async (formData: FormData) => {
    await fetch('/api/auth/register', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
};