import { constants } from '../constants';
import jwt from 'jsonwebtoken';
export function getUserInfo(token: string) {
    // decode the token and return the users email, name and sub
    const decoded = jwt.decode(token) as { email?: string; name?: string; sub?: string };
    return {
        email: decoded.email,
        name: decoded.name,
        sub: decoded.sub
    };
}
const userSubCache: { [key: string]: object } = {};
export async function getUserInfoCached(sub: string, token: string) {
    if (!userSubCache[sub]) {
        userSubCache[sub] = await getUserInfo(token);
    }
    return userSubCache[sub];
}