"use client";

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
import { useState, useEffect } from "react";
import { loginService, signUpService } from "../services/authService";

interface FormData {
  email: string;
  password: string;
}

export default function AuthPage({ isLogin }: { isLogin: boolean }) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  // Ensure rendering happens only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Prevents SSR mismatch

  const validateForm = (): boolean => {
    let newErrors: Partial<FormData> = {};
    if (!formData.email.includes("@"))
      newErrors.email = "Invalid email address";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error on change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = isLogin
        ? loginService(formData)
        : signUpService(formData);

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Something went wrong");

      alert(isLogin ? "Login successful!" : "Registration successful!");
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
          {isLogin ? "Sign In" : "Sign Up"}
        </Typography>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
        >
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
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          {isLogin ? (
            <span>
              Don't have an account?{" "}
              <Link
                href="/signup"
                style={{ textDecoration: "none", color: "#1976d2" }}
              >
                Sign up
              </Link>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <Link
                href="/login"
                style={{ textDecoration: "none", color: "#1976d2" }}
              >
                Sign in
              </Link>
            </span>
          )}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Google />}
            sx={{
              mb: 1,
              backgroundColor: "#DB4437",
              color: "white",
              "&:hover": { backgroundColor: "#c1351d" },
            }}
            onClick={() => console.log("Google Sign-In")}
          >
            Sign in with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
