"use client";

import React from "react";

import { useState } from "react";
import { apiClient, type VideoFormData } from "@/lib/api-client";
import type { IVideo } from "@/models/Video";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, CheckCircle, WifiOff } from "lucide-react";

interface VideoUploadModalProps {
  onClose: () => void;
  onVideoUploaded: (video: IVideo) => void;
}

export default function VideoUploadModal({
  onClose,
  onVideoUploaded,
}: VideoUploadModalProps) {
  const [formData, setFormData] = useState<Partial<VideoFormData>>({
    title: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState<any>(null);
  const [thumbnailFile, setThumbnailFile] = useState<any>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<{
    video?: string;
    thumbnail?: string;
  }>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network status monitoring
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleVideoUpload = (res: any) => {
    setVideoFile(res);
    setIsVideoUploading(false);
    setVideoUploadProgress(100);
    setUploadErrors((prev) => ({ ...prev, video: undefined }));
    console.log("Video uploaded successfully:", res);
  };

  const handleVideoUploadStart = () => {
    setIsVideoUploading(true);
    setVideoUploadProgress(0);
    setUploadErrors((prev) => ({ ...prev, video: undefined }));
  };

  const handleVideoUploadError = (error: string) => {
    setUploadErrors((prev) => ({ ...prev, video: error }));
    setIsVideoUploading(false);
  };

  const handleThumbnailUpload = (res: any) => {
    setThumbnailFile(res);
    setIsThumbnailUploading(false);
    setThumbnailUploadProgress(100);
    setUploadErrors((prev) => ({ ...prev, thumbnail: undefined }));
    console.log("Thumbnail uploaded successfully:", res);
  };

  const handleThumbnailUploadStart = () => {
    setIsThumbnailUploading(true);
    setThumbnailUploadProgress(0);
    setUploadErrors((prev) => ({ ...prev, thumbnail: undefined }));
  };

  const handleThumbnailUploadError = (error: string) => {
    setUploadErrors((prev) => ({ ...prev, thumbnail: error }));
    setIsThumbnailUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !videoFile ||
      !thumbnailFile ||
      !formData.title ||
      !formData.description
    ) {
      alert(
        "Please provide all required fields: title, description, video, and thumbnail"
      );
      return;
    }

    if (!isOnline) {
      alert(
        "No internet connection. Please check your connection and try again."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const videoData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        videoUrl: videoFile.url,
        thumbnailUrl: thumbnailFile.url,
        controls: true,
        transformation: {
          width: 1080,
          height: 1920,
          quality: 100,
        },
      };

      console.log("Creating video with data:", videoData);
      const response = await apiClient.createVideo(videoData);
      console.log("Video created successfully:", response);

      onVideoUploaded(response as IVideo);
    } catch (error: any) {
      console.error("Error creating video:", error);

      let errorMessage = "Failed to create video. Please try again.";
      if (error.message?.includes("401")) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error.message?.includes("413")) {
        errorMessage =
          "Video data is too large. Please try with smaller files.";
      } else if (error.message?.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    videoFile &&
    thumbnailFile &&
    formData.title &&
    formData.description &&
    !isVideoUploading &&
    !isThumbnailUploading &&
    !isSubmitting;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Video
            {!isOnline && <WifiOff className="h-4 w-4 text-red-500" />}
          </DialogTitle>
          <DialogDescription>
            Share your tech knowledge with the TechTube community
            {!isOnline && (
              <span className="text-red-500 block mt-1">
                ⚠️ No internet connection detected
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Network Status Alert */}
          {!isOnline && (
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                No internet connection. Please check your connection before
                uploading.
              </AlertDescription>
            </Alert>
          )}

          {/* Video Upload */}
          <div className="space-y-2">
            <Label>Video File *</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              {videoFile ? (
                <div className="space-y-2">
                  <div className="text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Video uploaded: {videoFile.name}
                  </div>
                  <Progress value={100} className="w-full" />
                </div>
              ) : (
                <FileUpload
                  onSuccess={handleVideoUpload}
                  onProgress={setVideoUploadProgress}
                  onUploadStart={handleVideoUploadStart}
                  onError={handleVideoUploadError}
                  fileType="video"
                />
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label>Thumbnail *</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              {thumbnailFile ? (
                <div className="space-y-2">
                  <div className="text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Thumbnail uploaded: {thumbnailFile.name}
                  </div>
                  <Progress value={100} className="w-full" />
                </div>
              ) : (
                <FileUpload
                  onSuccess={handleThumbnailUpload}
                  onProgress={setThumbnailUploadProgress}
                  onUploadStart={handleThumbnailUploadStart}
                  onError={handleThumbnailUploadError}
                  fileType="image"
                />
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter video title"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              {formData.title?.length || 0}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe your video..."
              rows={4}
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {formData.description?.length || 0}/500 characters
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!canSubmit || !isOnline}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Video...
              </>
            ) : isVideoUploading || isThumbnailUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading Files...
              </>
            ) : (
              "Upload Video"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
