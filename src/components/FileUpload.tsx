"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import type React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { UploadIcon, AlertCircle, RefreshCw, X } from "lucide-react";

interface FileUploadProps {
  onSuccess: (res: any) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
  onError?: (error: string) => void;
  onUploadStart?: () => void;
}

const FileUpload = ({
  onSuccess,
  fileType,
  onProgress,
  onError,
  onUploadStart,
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxRetries = 3;

  // Enhanced file validation
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // File type validation
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        return {
          isValid: false,
          error: "Please upload a valid video file (MP4, MOV, AVI, etc.)",
        };
      }
      // Video file size limit: 100MB
      if (file.size > 100 * 1024 * 1024) {
        return {
          isValid: false,
          error: "Video file size must be less than 100MB",
        };
      }
    } else if (fileType === "image") {
      if (!file.type.startsWith("image/")) {
        return {
          isValid: false,
          error: "Please upload a valid image file (JPG, PNG, GIF, etc.)",
        };
      }
      // Image file size limit: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return {
          isValid: false,
          error: "Image file size must be less than 10MB",
        };
      }
    }

    // General file name validation
    if (file.name.length > 100) {
      return {
        isValid: false,
        error: "File name is too long (max 100 characters)",
      };
    }

    return { isValid: true };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getDetailedErrorMessage = (error: any): string => {
    if (error instanceof ImageKitAbortError) {
      return "Upload was cancelled. Please try again.";
    } else if (error instanceof ImageKitInvalidRequestError) {
      return `Invalid request: ${error.message}. Please check your file and try again.`;
    } else if (error instanceof ImageKitServerError) {
      return `Server error: ${error.message}. Please try again later.`;
    } else if (error instanceof ImageKitUploadNetworkError) {
      return "Network error occurred. Please check your internet connection and try again.";
    } else if (error.message?.includes("413")) {
      return "File is too large. Please choose a smaller file.";
    } else if (error.message?.includes("timeout")) {
      return "Upload timed out. Please check your connection and try again.";
    } else if (error.message?.includes("CORS")) {
      return "Cross-origin request blocked. Please contact support.";
    } else {
      return `Upload failed: ${error.message || "Unknown error occurred"}`;
    }
  };

  const handleFileSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setUploadProgress(0);

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error!);
      onError?.(validation.error!);
      return;
    }

    console.log(`Starting ${fileType} upload:`, {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
    });

    setUploading(true);
    onUploadStart?.();

    try {
      // Get ImageKit authentication
      const authRes = await fetch("/api/imagekit-auth");
      if (!authRes.ok) {
        throw new Error(
          `Authentication failed: ${authRes.status} ${authRes.statusText}`
        );
      }

      const auth = await authRes.json();
      console.log("ImageKit auth obtained successfully");

      // Validate environment variables
      if (!process.env.NEXT_PUBLIC_PUBLIC_KEY) {
        throw new Error("ImageKit public key not configured");
      }

      // Upload file with enhanced error handling
      const res = await upload({
        file,
        fileName: `${Date.now()}_${file.name}`,
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
        expire: auth.expire,
        signature: auth.signature,
        token: auth.token,
        folder: fileType === "video" ? "/videos" : "/thumbnails",
        onProgress: (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
            onProgress?.(percent);
            console.log(`Upload progress: ${percent}%`);
          }
        },
      });

      console.log("Upload successful:", res);
      onSuccess(res);
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = getDetailedErrorMessage(error);
      setError(errorMessage);
      onError?.(errorMessage);

      // Auto-retry logic for network errors
      if (
        (error instanceof ImageKitUploadNetworkError ||
          error.message?.includes("network")) &&
        retryCount < maxRetries
      ) {
        console.log(
          `Retrying upload (attempt ${retryCount + 1}/${maxRetries})`
        );
        setRetryCount(retryCount + 1);
        setTimeout(() => {
          if (fileInputRef.current) {
            const event = {
              target: {
                files: fileInputRef.current?.files
                  ? [fileInputRef.current.files[0]]
                  : [],
              },
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileSubmit(event); // Retry the upload
          }
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    if (fileInputRef.current?.files?.[0]) {
      const event = {
        target: { files: [fileInputRef.current.files[0]] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSubmit(event);
    }
  };

  const clearError = () => {
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 border-dashed hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click to upload {fileType}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {fileType === "video" ? "Max. 100MB" : "Max. 10MB"}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSubmit}
          accept={fileType === "video" ? "video/*" : "image/*"}
          disabled={uploading}
        />
      </label>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Uploading {fileType}...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
          {retryCount > 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Retry attempt {retryCount}/{maxRetries}
            </p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="flex-1">{error}</span>
            <div className="flex gap-2 ml-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={uploading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
              <Button size="sm" variant="ghost" onClick={clearError}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Tips */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          • Supported formats:{" "}
          {fileType === "video" ? "MP4, MOV, AVI, MKV" : "JPG, PNG, GIF, WebP"}
        </p>
        <p>• Max file size: {fileType === "video" ? "100MB" : "10MB"}</p>
        <p>• Ensure stable internet connection for large files</p>
      </div>
    </div>
  );
};

export default FileUpload;
