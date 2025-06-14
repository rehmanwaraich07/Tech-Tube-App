import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== User Videos API Called ===");

    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Found" : "Not found");

    if (!session) {
      console.log("No session found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User email:", session.user?.email);
    console.log("User ID:", session.user?.id);

    await connectToDatabase();
    console.log("Database connected successfully");

    // Find videos uploaded by the current user - handle both old and new video formats
    const query = {
      $or: [
        { "uploadedBy.email": session.user?.email },
        { "uploadedBy.id": session.user?.id },
        // Fallback for videos without uploadedBy field (legacy videos)
        { author: session.user?.email },
      ],
    };

    console.log("Query:", JSON.stringify(query, null, 2));

    const videos = await Video.find(query).sort({ createdAt: -1 }).lean();

    console.log(`Found ${videos.length} videos for user`);
    console.log(
      "Videos:",
      videos.map((v) => ({
        id: v._id,
        title: v.title,
        uploadedBy: v.uploadedBy,
        author: v.author,
      }))
    );

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching user videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Add OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
