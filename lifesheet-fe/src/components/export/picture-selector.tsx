import * as React from 'react';
import { Check, User } from 'lucide-react';
import { SecureImg } from '@/components/ui/secure-img';
import { useEffect } from 'react';
import userService from '@/services/user-service';

interface PictureSelectorProps {
  onPictureSelected: (pictureId: string | undefined) => void;
}

export function PictureSelector({ onPictureSelected }: PictureSelectorProps) {
  const [pictures, setPictures] = React.useState<string[]>([]);
  const [isLoadingPictures, setIsLoadingPictures] = React.useState(true);
  const [error, setError] = React.useState<string>('');
  const [selectedPicture, setSelectedPicture] = React.useState<string>('');

  useEffect(() => {
    const loadPictures = async () => {
      setIsLoadingPictures(true);
      try {
        const userPictures = await userService.getUserPictures();
        setPictures(userPictures);
        if (userPictures.length > 0) {
          // Set the first picture as selected by default
          setSelectedPicture(userPictures[0]);
          onPictureSelected(userPictures[0]);
        } else {
          onPictureSelected(undefined);
        }
      } catch (error) {
        console.error('Error loading pictures:', error);
        setError('Failed to load pictures. Please try again later.');
      } finally {
        setIsLoadingPictures(false);
      }
    };
    loadPictures();
  }, []);
  // Call the parent callback directly when the user selects an item to avoid
  // re-running an effect when the parent's handler identity changes.

  return (
    <>
      {isLoadingPictures ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading pictures...</p>
        </div>
      ) : pictures.length === 0 ? (
        <div className="text-center py-8">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No pictures uploaded yet</p>
          <p className="text-sm text-muted-foreground">
            Upload pictures in your CV dashboard first
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Choose a picture to include in your tailored CV
          </p>

          {/* No Picture Option */}
          <div
            onClick={() => {
              setSelectedPicture('');
              onPictureSelected(undefined);
            }}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
              selectedPicture === ''
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              <User className="h-6 w-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium">No picture</p>
              <p className="text-sm text-muted-foreground">Don't include a profile picture</p>
            </div>
            {selectedPicture === '' && <Check className="h-5 w-5 text-blue-500" />}
          </div>

          {/* Picture Options */}
          <div className="grid grid-cols-1 gap-2">
            {pictures.map((pictureId, index) => (
              <div
                key={pictureId}
                onClick={() => {
                  setSelectedPicture(pictureId);
                  onPictureSelected(pictureId);
                }}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedPicture === pictureId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 bg-gray-100">
                  <SecureImg
                    pictureId={pictureId}
                    alt={`Profile picture ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Picture {index + 1}</p>
                  <p className="text-sm text-muted-foreground">Profile picture option</p>
                </div>
                {selectedPicture === pictureId && <Check className="h-5 w-5 text-blue-500" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default PictureSelector;
