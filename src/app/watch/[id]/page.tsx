"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { IVideo } from "@/models/Video";
import VideoPlayer from "@/components/VideoPlayer";
import VideoInfo from "@/components/VideoInfo";
import RelatedVideos from "@/components/RelatedVideos";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [video, setVideo] = useState<IVideo | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videoId = params.id as string;
  const autoplay = searchParams.get("autoplay") === "true";

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch specific video
        const videoResponse = await fetch(`/api/videos/${videoId}`);
        if (!videoResponse.ok) {
          throw new Error("Video not found");
        }
        const videoData = await videoResponse.json();
        setVideo(videoData);

        // Fetch related videos
        const relatedResponse = await apiClient.getVideos();
        const allVideos = Array.isArray(relatedResponse)
          ? relatedResponse
          : (relatedResponse as { videos: IVideo[] }).videos || [];
        const filtered = allVideos
          .filter((v: IVideo) => v._id?.toString() !== videoId)
          .slice(0, 10);
        setRelatedVideos(filtered);

        // Increment view count
        await fetch(`/api/videos/${videoId}/view`, { method: "POST" });
      } catch (err: any) {
        setError(err.message || "Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  if (loading) {
    return <VideoPageSkeleton />;
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Video not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer video={video} autoplay={autoplay} />
            <VideoInfo video={video} />
          </div>

          {/* Related Videos Sidebar */}
          <div className="lg:col-span-1">
            <RelatedVideos videos={relatedVideos} />
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-40 h-24 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
