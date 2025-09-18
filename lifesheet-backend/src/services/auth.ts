import { constants } from '../constants';
import jwt from 'jsonwebtoken';
export function getUserInfo(token: string) {
  // decode the token and return the users email, name and sub
  const decoded = jwt.decode(token) as { email?: string; name?: string; sub?: string };
  return {
    email: decoded.email,
    name: decoded.name,
    sub: decoded.sub,
  };
}
const userSubCache: { [key: string]: object } = {};
export async function getUserInfoCached(sub: string, token: string) {
  if (!userSubCache[sub]) {
    userSubCache[sub] = await getUserInfo(token);
  }
  return userSubCache[sub];
}
// Function to get service account token using client credentials flow
async function getServiceAccountToken() {
  try {
    const url = `https://${constants.AUTH_DOMAIN}/realms/${constants.AUTH_REALM}/protocol/openid-connect/token`;
    const formData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: constants.AUTH_API_CLIENT_ID,
      client_secret: constants.AUTH_API_CLIENT_SECRET,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log('Service account token obtained successfully');
    return data.access_token;
  } catch (error: unknown) {
    console.error(
      'Error getting service account token:',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

export async function deleteUserFromAuth(sub: string) {
  //note: sub is the user ID in Keycloak
  try {
    const token = await getServiceAccountToken();
    // Get user info
    const response = await fetch(
      `https://${constants.AUTH_DOMAIN}/admin/realms/${constants.AUTH_REALM}/users/${sub}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorData}`);
    }
    console.log('User deleted successfully');
  } catch (error: unknown) {
    console.error(
      `Error deleting user with sub ${sub} from auth system:`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}
