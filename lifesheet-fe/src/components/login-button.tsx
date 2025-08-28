import { useKeycloak } from "@react-keycloak/web";

const LoginButton = () => {
  const { keycloak } = useKeycloak();
  return <button onClick={() => keycloak?.login()}>Log In</button>;
};

export default LoginButton;