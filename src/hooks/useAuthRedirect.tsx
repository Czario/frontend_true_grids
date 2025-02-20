import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/modules/auth/utils/cookies";

const useAuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (getCookie("login") !== "true") {
      const currentPath = window.location.pathname;
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [router]);
};

export default useAuthRedirect;