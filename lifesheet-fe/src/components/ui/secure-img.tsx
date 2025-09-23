import { useState, useEffect } from 'react';
import * as userService from '@/services/user-service';
import { useAuth } from '@/hooks/auth-hook';
interface SecureImgProps {
  pictureId: string;
  alt?: string;
  className?: string;
}
const placeholder =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5QzEwLjM0MzEgOSA5IDEwLjM0MzEgOSAxMkM5IDEzLjY1NjkgMTAuMzQzMSAxNSAxMkM5IDE1IDEwLjM0MzEgMTMgMTUgMTVDMTMuNjU2OSAxNSAxNSAxMy42NTY5IDE1IDEyQzE1IDEwLjM0MzEgMTMuNjU2OSAxMiAxMiAxMkM5IDEzLjY1NjkgOSA5LjM0MzEgOSA5WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4=';

export function SecureImg({ pictureId, alt, className }: SecureImgProps) {
  const [error, setError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth();
  useEffect(() => {
    if (!pictureId) {
      setError(true);
      return;
    }

    const loadImage = async () => {
      try {
        const token = await getAccessTokenSilently();
        const blob = await userService.getPicture(pictureId, token);
        if (blob) {
          setBlobUrl(blob);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    };

    loadImage();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [pictureId]);

  const src = error || !blobUrl ? placeholder : blobUrl;

  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
}
