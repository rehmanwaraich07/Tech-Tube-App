"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { IVideo } from "@/models/Video";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import VideoUploadModal from "@/components/VideoUploadModal";
import { Calendar, Mail, User, Settings, Upload } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  const handleVideoUploaded = (newVideo: IVideo) => {
    setShowUploadModal(false);
    // Optionally show a success message or redirect to the video
    console.log("Video uploaded successfully:", newVideo);
    // You could redirect to the video page or show a success toast
    // router.push(`/watch/${newVideo._id}`)
  };

  const getUserDisplayName = () => {
    if (!session?.user?.email) return "User";
    return session.user.email.split("@")[0];
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading") {
    return <ProfilePageSkeleton />;
  }

  if (status === "unauthenticated") {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-32 h-32 mb-6">
              <AvatarFallback className="bg-red-600 text-white text-4xl">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {getUserDisplayName()}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              TechTube Member
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 text-gray-600 dark:text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span>{session?.user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Joined {formatDate(new Date().toISOString())}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">
                Display Name
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {getUserDisplayName()}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">
                Email Address
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {session?.user?.email}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">
                Account Type
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Standard User
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">
                Member Since
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {formatDate(new Date().toISOString())}
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="font-medium text-gray-900 dark:text-white">
                Status
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="h-6 w-6" />
              <span>Upload New Video</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push("/")}
            >
              <User className="h-6 w-6" />
              <span>Browse Videos</span>
            </Button>
          </div>
        </div>
      </div>

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

function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col items-center text-center">
            <Skeleton className="w-32 h-32 rounded-full mb-6" />
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="flex gap-6 mb-8">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
