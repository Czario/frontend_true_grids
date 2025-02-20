"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/contexts/AppStoreContext";
import { SignupForm, SignupResponse } from "../interfaces/LoginSignup";
import { signupService } from "../services/authService";

import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Google } from "@mui/icons-material";
import Link from "next/link";
import { useState } from "react";
import GoogleLoginButton from "./GoogleLoginButton";

export default function SignupPage() {
  const router = useRouter();
  const { setUserlogin } = useAppStore();
  const [formData, setFormData] = useState<SignupForm>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<SignupForm>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    let newErrors: Partial<SignupForm> = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 6 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const result: SignupResponse = await signupService(formData);
      if (result.success) {
        setUserlogin(true);
        router.push("/financials");
      } else {
        setErrorMessage(result.message || null);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={6} sx={{ p: 4, textAlign: "center", mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Sign Up
        </Typography>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
        >
          <TextField
            label="First Name"
            variant="outlined"
            fullWidth
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
          <TextField
            label="Last Name"
            variant="outlined"
            fullWidth
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />
          <TextField
            label="Confirm Password"
            variant="outlined"
            fullWidth
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Sign Up"
            )}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          <span>
            Already have an account?{" "}
            <Link
              href="/login"
              style={{ textDecoration: "none", color: "#1976d2" }}
            >
              Sign in
            </Link>
          </span>
        </Typography>

        <Box sx={{ mt: 3 }}>
        <GoogleLoginButton />
        </Box>
      </Paper>
    </Container>
  );
}