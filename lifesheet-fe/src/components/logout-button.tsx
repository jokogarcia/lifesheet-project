import { useKeycloak } from "@react-keycloak/web";
import { Button } from "./ui/button";
import { LogOutIcon } from "lucide-react";

const LogoutButton = () => {
  const { keycloak } = useKeycloak();
  return (
    <Button variant="outline" style={{color: "red"}} onClick={() => keycloak?.logout({ redirectUri: window.location.origin })}>
      <LogOutIcon className="h-4 w-4 mr-2" />
      Log Out
    </Button>
  );
};

export default LogoutButton;