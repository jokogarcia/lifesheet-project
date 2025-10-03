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
  let protocol = req.protocol;
  // If behind a proxy (like Nginx), check the X-Forwarded-Proto header
  if (req.get('X-Forwarded-Proto')) {
    protocol = req.get('X-Forwarded-Proto')!.split(',')[0]; // Use the first value if there are multiple
  }
  const host = req.get('host');
  console.log('Determined protocol:', protocol);
  console.log('Determined host:', host);
  return `${protocol}://${host}`;
}
