import { FileText, Upload, Trash2 } from 'lucide-react';
import { SecureImg } from '../ui/secure-img';
import { useState } from 'react';

interface PicturesTabProps {
  pictures: string[];
  isUploadingPicture: boolean;
  handlePictureUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeletePicture: (pictureId: string) => void;
}

export function PicturesTab({
  pictures,
  isUploadingPicture,
  handlePictureUpload,
  handleDeletePicture,
}: PicturesTabProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const syntheticEvent = {
        target: { files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handlePictureUpload(syntheticEvent);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Profile Pictures</h3>
        </div>

        {/* Upload Section */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
            isDraggingOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
          }`}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <label htmlFor="picture-upload" className="cursor-pointer">
              <span className="text-lg font-medium">Click to upload a picture</span>
              <p className="text-sm text-muted-foreground">or drag and drop</p>
            </label>
            <input
              id="picture-upload"
              type="file"
              accept=".png,.jpg,.jpeg,.gif,.webp"
              onChange={handlePictureUpload}
              className="hidden"
              disabled={isUploadingPicture}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Supported formats: PNG, JPG, JPEG, GIF, WebP (Max 5MB)
          </p>
          {isUploadingPicture && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
            </div>
          )}
        </div>

        {/* Pictures Grid */}
        <div>
          <h4 className="font-semibold text-lg mb-4">Your Pictures ({pictures.length})</h4>
          {pictures.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No pictures uploaded yet</p>
              <p className="text-sm text-muted-foreground">Upload your first picture above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pictures.map((pictureId, index) => (
                <div
                  key={pictureId}
                  className="relative group border rounded-lg overflow-hidden bg-gray-50 aspect-square"
                >
                  <SecureImg
                    pictureId={pictureId}
                    alt={`Profile picture ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <button
                      onClick={() => handleDeletePicture(pictureId)}
                      className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                      title="Delete picture"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
