"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { IVideo } from "@/models/Video";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, AlertCircle, Video } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      searchVideos(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const searchVideos = async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setVideos(data);
    } catch (err: any) {
      setError(err.message || "Failed to search videos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {query ? `Search results for "${query}"` : "Search Videos"}
            </h1>
          </div>

          {!query && (
            <p className="text-gray-600 dark:text-gray-400">
              Use the search bar above to find videos
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SearchResultSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Search Results */}
        {!loading && !error && query && (
          <>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Found {videos.length} result{videos.length !== 1 ? "s" : ""} for
                "{query}"
              </p>
            </div>

            {videos.length === 0 ? (
              <div className="text-center py-16">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No videos found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try searching with different keywords
                </p>
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
      </div>
    </div>
  );
}

function SearchResultSkeleton() {
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
