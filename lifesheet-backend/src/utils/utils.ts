import { Request } from 'express';
export function getSecondsUntilTomorrow(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
}
export function getSecondsUntilNextWeek(): number {
  const now = new Date();
  const nextMonday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + ((8 - now.getDay()) % 7)
  );
  return Math.floor((nextMonday.getTime() - now.getTime()) / 1000);
}
export function getApiUrl(req: Request): string {
  console.log('Request protocol:', req.protocol);
  return `${req.protocol}://${req.get('host')}`;
}
