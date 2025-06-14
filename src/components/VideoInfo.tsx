"use client";

import { useState } from "react";
import type { IVideo } from "@/models/Video";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, Share, Download, Eye } from "lucide-react";

interface VideoInfoProps {
  video: IVideo;
}

export default function VideoInfo({ video }: VideoInfoProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatViews = (views: number) => {
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1000000).toFixed(1)}M views`;
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

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  return (
    <div className="space-y-4">
      {/* Video Title */}
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        {video.title}
      </h1>

      {/* Video Stats and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {video.views !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{formatViews(video.views)}</span>
            </div>
          )}
          {(video as any).createdAt && (
            <span>{formatDate((video as any).createdAt)}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={liked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            className={liked ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Like
          </Button>
          <Button
            variant={disliked ? "default" : "outline"}
            size="sm"
            onClick={handleDislike}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            Dislike
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Channel Info */}
      <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-red-600 text-white">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {getUserDisplayName()}
            </h3>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Subscribe
            </Button>
          </div>

          {/* Description */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className={`${isDescriptionExpanded ? "" : "line-clamp-3"}`}>
              {video.description}
            </p>
            {video.description.length > 150 && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-gray-600 dark:text-gray-400"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                {isDescriptionExpanded ? "Show less" : "Show more"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
