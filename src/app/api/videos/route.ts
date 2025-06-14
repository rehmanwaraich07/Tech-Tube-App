import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video, { type IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Remove session check for GET requests to allow public viewing
    const videos = await Video.find({}).sort({ createdAt: -1 }).lean();

    if (!videos || videos.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to Fetch Videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body: IVideo = await request.json();

    if (
      !body.title ||
      !body.description ||
      !body.videoUrl ||
      !body.thumbnailUrl
    ) {
      return NextResponse.json(
        { error: "Missing Required Fields" },
        { status: 400 }
      );
    }

    const videoData = {
      ...body,
      controls: body?.controls ?? true,
      transformation: {
        height: 1920,
        width: 1080,
        quality: body?.transformation?.quality ?? 100,
      },
      uploadedBy: {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name,
      },
      views: 0,
    };

    const newVideo = await Video.create(videoData);

    return NextResponse.json(newVideo);
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create Video" },
      { status: 500 }
    );
  }
}
