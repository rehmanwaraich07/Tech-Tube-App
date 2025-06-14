import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    await Video.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json(
      { error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}
