import React from "react";
import { Button } from "@mui/material";
import { Google } from "@mui/icons-material";

const GoogleLoginButton: React.FC = () => {
  return (
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
      onClick={() => {
        window.location.href = "http://127.0.0.1:3001/auth/google";
    }}
    >
      Sign in with Google
    </Button>
  );
};

export default GoogleLoginButton;