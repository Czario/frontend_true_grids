"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCookie, setCookie } from "@/modules/auth/utils/cookies";

const LoginPage = dynamic(() => import("@/modules/auth/components/LoginPage"), {
  ssr: false,
});

const Login = () => {
  const router = useRouter();

  useEffect(() => {
    if (getCookie("login") === "true") {
      const redirectTo = new URLSearchParams(window.location.search).get("redirect") || "/";
      router.replace(redirectTo);
    }
  }, [router]);

  const handleLogin = () => {
    // Simulate login logic
    setCookie("login", "true");
    const redirectTo = new URLSearchParams(window.location.search).get("redirect") || "/";
    router.replace(redirectTo);
  };

  return <LoginPage onLogin={handleLogin} />;
};

export default Login;