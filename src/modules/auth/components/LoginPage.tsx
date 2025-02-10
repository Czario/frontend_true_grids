"use client";

import { useRouter } from "next/navigation";
import { LoginForm, LoginResponse } from "@/modules/auth/interfaces/Login";

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
import { loginService } from "../services/authService";

export default function AuthPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Prevents SSR mismatch

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const result: LoginResponse = await loginService(formData);
      if (result.success) {
        router.replace("/financials");
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
          "Sign In"
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
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          <span>
            Don't have an account?{" "}
            <Link
              href="/signup"
              style={{ textDecoration: "none", color: "#1976d2" }}
            >
              Sign up
            </Link>
          </span>
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
