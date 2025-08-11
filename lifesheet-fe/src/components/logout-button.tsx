import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "./ui/button";
import { LogOutIcon } from "lucide-react";

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <Button variant="outline" style={{color: "red"}} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
      <LogOutIcon className="h-4 w-4 mr-2" />
      Log Out
    </Button>
  );
};

export default LogoutButton;