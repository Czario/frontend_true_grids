"use client";
import dynamic from "next/dynamic";

const SignupPage = dynamic(() => import("@/modules/auth/components/RegisterPage"), {
  ssr: false,
});

const Signup = () => {
  return (
    <>
      <SignupPage />
    </>
  );
};

export default Signup;