import { useKeycloak } from "@react-keycloak/web";
/**
 * This hook is meant to provide a drop-in replacement for Auth0 useAuth hook
 * but using keycloak
 */
export function useAuth() {
    const { keycloak } = useKeycloak();
    return {
        isAuthenticated: keycloak.authenticated,
        user: keycloak.tokenParsed,
        loginWithRedirect: keycloak.login,
        logout: keycloak.logout,
        getAccessTokenSilently: async () => {
            if (keycloak.authenticated) {
                if(!keycloak.token){
                    throw new Error("Token not found, although user is authenticated");
                }
                return keycloak.token;
            }
            throw new Error("User is not authenticated");
        },

    };
}
