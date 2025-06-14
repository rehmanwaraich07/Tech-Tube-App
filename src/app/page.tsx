"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import type { IVideo } from "@/models/Video";
import VideoCard from "@/components/VideoCard";
import Header from "@/components/Header";
import VideoUploadModal from "@/components/VideoUploadModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle, Video } from "lucide-react";

export default function HomePage() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { data: session, status } = useSession();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getVideos();
      // Handle the response structure from your api-client
      setVideos(
        Array.isArray(response)
          ? response
          : (response as { videos: IVideo[] }).videos || []
      );
    } catch (err: any) {
      // Handle 401 errors more gracefully
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setError("Please sign in to view videos.");
      } else {
        setError("Failed to load videos. Please try again.");
      }
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch videos when session status is resolved
    if (status !== "loading") {
      fetchVideos();
    }
  }, [status]);

  const handleVideoUploaded = (newVideo: IVideo) => {
    setVideos((prev) => [newVideo, ...prev]);
    setShowUploadModal(false);
  };

  // Show loading while session is being checked
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-inter">
                Welcome to TechTube
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover the latest tech videos and tutorials from our community
              </p>
            </div>

            {session && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {error.includes("sign in") && (
                <Button variant="link" className="p-0 ml-2 h-auto" asChild>
                  <a href="/login">Sign in here</a>
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Videos Grid */}
        {!loading && !error && (
          <>
            {videos.length === 0 ? (
              <div className="text-center py-16">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No videos yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {session
                    ? "Be the first to share a tech video with the community!"
                    : "Sign in to start sharing and viewing tech videos!"}
                </p>
                {session ? (
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload First Video
                  </Button>
                ) : (
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    asChild
                  >
                    <a href="/login">Sign In</a>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video._id?.toString()} video={video} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <VideoUploadModal
          onClose={() => setShowUploadModal(false)}
          onVideoUploaded={handleVideoUploaded}
        />
      )}
    </div>
  );
}

// Loading skeleton component
function VideoCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <Skeleton className="w-full aspect-video" />
      <div className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2 mb-2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
