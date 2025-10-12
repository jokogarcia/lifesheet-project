import { PenTool, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import type { CV, Signature } from '../../services/cvs-service';
import { FormattedMessage, useIntl } from 'react-intl';
import { constants } from '@/constants';
import * as userService from '../../services/user-service';
import { useAuth } from '@/hooks/auth-hook';
import { SecureImg } from '../ui/secure-img';
interface SignatureTabProps {
  isEditing: boolean;
  signature: Signature | null;
  setSignature: (signature: Signature | null) => void;
  cv: CV | null;
}

export function SignatureTab({
  isEditing,
  signature,
  setSignature,
  cv,
}: SignatureTabProps) {
  const intl = useIntl();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const authService = useAuth();

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
      } as React.ChangeEvent<HTMLInputElement>;
      handleSignatureUpload(syntheticEvent);
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('image/png')) {
      alert(intl.formatMessage({
        id: 'signature.error.invalidFormat',
        defaultMessage: 'Please upload a PNG file only.'
      }));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > constants.MAX_FILE_SIZE) {
      alert(intl.formatMessage({
        id: 'signature.error.fileTooLarge',
        defaultMessage: 'File size must be less than 2MB.'
      }));
      return;
    }

    setIsUploading(true);
    try {
      let imageId: string;
      const token = await authService.getAccessTokenSilently();
      imageId = await userService.uploadPicture(file, token);
      // Create signature object with current date
      const newSignature: Signature = {
        imageId: imageId,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      };

      setSignature(newSignature);
    } catch (error) {
      console.error('Error uploading signature:', error);
      alert(intl.formatMessage({
        id: 'signature.error.uploadFailed',
        defaultMessage: 'Failed to upload signature. Please try again.'
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const removeSignature = () => {
    setSignature(null);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
        <div className="flex items-center gap-2 mb-4">
          <PenTool className="h-5 w-5" />
          <h3 className="font-semibold text-lg">
            <FormattedMessage id="dashboard.signature" defaultMessage="Digital Signature" />
          </h3>
        </div>
        <div className="space-y-6">
          {isEditing ? (
            <>
              {!signature ? (
                <div
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDraggingOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
                    }`}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <label htmlFor="signature-upload" className="cursor-pointer">
                      <span className="text-lg font-medium">
                        <FormattedMessage id="dashboard.clickToUploadSignature" defaultMessage="Click to upload your signature" />
                      </span>
                      <p className="text-sm text-muted-foreground">
                        <FormattedMessage id="dashboard.orDragAndDrop" defaultMessage="or drag and drop" />
                      </p>
                    </label>
                    <input
                      id="signature-upload"
                      type="file"
                      accept=".png"
                      onChange={handleSignatureUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <FormattedMessage
                      id="dashboard.signatureFormats"
                      defaultMessage="PNG format only (Max 2MB)"
                    />
                  </p>
                  {isUploading && (
                    <div className="mt-4">
                      <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                        <FormattedMessage id="dashboard.uploading" defaultMessage="Uploading..." />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <SecureImg
                        pictureId={signature.imageId}
                        alt={intl.formatMessage({
                          id: 'dashboard.signaturePreview',
                          defaultMessage: 'Signature preview'
                        })}
                        className="h-20 w-auto border border-gray-300 rounded bg-white max-w-[250px]" />

                      <div>
                        <p className="font-medium">
                          <FormattedMessage id="dashboard.signatureUploaded" defaultMessage="Signature uploaded" />
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <FormattedMessage
                            id="dashboard.signatureDate"
                            defaultMessage="Date: {date}"
                            values={{ date: signature.date }}
                          />
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <label htmlFor="signature-replace" className="cursor-pointer">
                        <div className="bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors">
                          <FormattedMessage id="dashboard.replace" defaultMessage="Replace" />
                        </div>
                        <input
                          id="signature-replace"
                          type="file"
                          accept=".png"
                          onChange={handleSignatureUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      <button
                        onClick={removeSignature}
                        className="bg-red-100 text-red-600 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {isUploading && (
                    <div className="text-center">
                      <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                        <FormattedMessage id="dashboard.uploading" defaultMessage="Uploading..." />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {!cv?.signature ? (
                <p className="text-muted-foreground text-center py-8">
                  <FormattedMessage id="dashboard.noSignature" defaultMessage="No signature uploaded yet" />
                </p>
              ) : (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-4">
                    <SecureImg
                      pictureId={cv.signature.imageId}
                      alt={intl.formatMessage({
                        id: 'dashboard.signaturePreview',
                        defaultMessage: 'Signature preview'
                      })}
                      className="h-20 w-auto border border-gray-300 rounded bg-white max-w-[250px]" />
                    <div>
                      <h4 className="font-medium">
                        <FormattedMessage id="dashboard.digitalSignature" defaultMessage="Digital Signature" />
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        <FormattedMessage
                          id="dashboard.signatureDate"
                          defaultMessage="Date: {date}"
                          values={{ date: cv.signature.date }}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
