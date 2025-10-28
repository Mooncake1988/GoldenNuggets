import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['image/*'],
      },
      autoProceed: true,
      allowMultipleUploadBatches: true,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        console.log('Upload complete:', result);
        onComplete?.(result);
        setShowModal(false);
      })
      .on("upload", () => {
        console.log('Upload started');
      })
      .on("upload-success", (file, response) => {
        console.log('File uploaded successfully:', file?.name, response);
      })
      .on("error", (error) => {
        console.error('Upload error:', error);
      })
  );

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Opening upload modal - button clicked');
    setShowModal(true);
  };

  return (
    <div>
      <Button 
        onClick={handleOpenModal} 
        className={buttonClassName} 
        type="button"
        data-testid="button-upload-images"
      >
        {children}
      </Button>

      {showModal && (
        <DashboardModal
          uppy={uppy}
          open={showModal}
          onRequestClose={() => setShowModal(false)}
          proudlyDisplayPoweredByUppy={false}
          disablePageScrollWhenModalOpen={true}
          animateOpenClose={false}
        />
      )}
    </div>
  );
}
