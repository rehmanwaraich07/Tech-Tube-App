"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IVideo } from "@/models/Video";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Play, Eye } from "lucide-react";
import { Image } from "@imagekit/next";

interface VideoCardProps {
  video: IVideo;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const formatDate = (date: string) => {
    const now = new Date();
    const videoDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - videoDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const formatViews = (views: number) => {
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1000000).toFixed(1)}M views`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleCardClick = () => {
    router.push(`/watch/${video._id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/watch/${video._id}?autoplay=true`);
  };

  const getUserDisplayName = () => {
    if (video.uploadedBy?.name) return video.uploadedBy.name;
    if (video.uploadedBy?.email) return video.uploadedBy.email.split("@")[0];
    return "TechTube User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg bg-white dark:bg-gray-800 border-0 shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Video Thumbnail */}
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              width={400}
              height={225}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800">
              <Play className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          )}

          {/* Duration Badge */}
          {video.duration && video.duration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Play Button Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Button
                size="sm"
                className="bg-white/90 text-black hover:bg-white transition-all duration-200 scale-110"
                onClick={handlePlayClick}
              >
                <Play className="h-4 w-4 mr-1 fill-current" />
                Play
              </Button>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4">
          <div className="flex gap-3">
            {/* User Avatar */}
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarFallback className="bg-red-600 text-white text-sm">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Video Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-red-600 transition-colors leading-tight">
                {video.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {getUserDisplayName()}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {video.views !== undefined && (
                  <>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatViews(video.views)}</span>
                    </div>
                    <span>•</span>
                  </>
                )}
                {(video as any).createdAt && (
                  <span>{formatDate((video as any).createdAt)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
