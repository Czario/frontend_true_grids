import { memo } from "react";
import useAuthRedirect from "@/hooks/useAuthRedirect";

const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthComponent = (props: any) => {
    useAuthRedirect();

    return <WrappedComponent {...props} />;
  };

  return memo(AuthComponent);
};

export default withAuth;