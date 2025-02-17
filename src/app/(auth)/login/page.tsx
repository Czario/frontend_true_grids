"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { getCookie } from "@/modules/auth/utils/cookies";
import { useRouter } from "next/navigation";

const LoginPage = dynamic(() => import("@/modules/auth/components/LoginPage"), {
  ssr: false,
});

const Login = () => {
  const router = useRouter();
  useEffect(() => {
    if (getCookie("login") === "true") {
      router.replace("/financials");
    }
  }, []);
  return (
    <>
      <LoginPage />
    </>
  );
};
export default Login;
