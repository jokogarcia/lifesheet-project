import { constants } from '../constants';
export async function getUserInfo(token: string) {
    const url = new URL('/userinfo', `https://${constants.AUTH0_DOMAIN}/`)
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}
const userSubCache: { [key: string]: object } = {};
export async function getUserInfoCached(sub: string, token: string) {
    if (!userSubCache[sub]) {
        userSubCache[sub] = await getUserInfo(token);
    }
    return userSubCache[sub];
}