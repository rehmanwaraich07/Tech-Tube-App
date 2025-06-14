"use client";

import type { IVideo } from "@/models/Video";
import { useRouter } from "next/navigation";
import { Image } from "@imagekit/next";
import { Play, Eye } from "lucide-react";

interface RelatedVideosProps {
  videos: IVideo[];
}

const RelatedVideos: React.FC<RelatedVideosProps> = ({ videos }) => {
  const router = useRouter();

  const formatViews = (views: number) => {
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1000000).toFixed(1)}M views`;
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const videoDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - videoDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getUserDisplayName = (video: IVideo) => {
    if (video.uploadedBy?.name) return video.uploadedBy.name;
    if (video.uploadedBy?.email) return video.uploadedBy.email.split("@")[0];
    return "TechTube User";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Related Videos
      </h2>
      <div className="space-y-3">
        {videos.map((video) => (
          <div
            key={video._id?.toString()}
            className="flex gap-3 cursor-pointer group"
            onClick={() => router.push(`/watch/${video._id}`)}
          >
            <div className="relative w-40 aspect-video bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  width={160}
                  height={90}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                {video.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {getUserDisplayName(video)}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                {video.views !== undefined && (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>{formatViews(video.views)}</span>
                    <span>•</span>
                  </>
                )}
                {(video as any).createdAt && (
                  <span>{formatDate((video as any).createdAt)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedVideos;
