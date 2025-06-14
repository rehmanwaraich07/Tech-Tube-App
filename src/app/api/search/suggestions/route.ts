import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    await connectToDatabase();

    // Get unique titles and descriptions that match the query
    const videos = await Video.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .select("title description")
      .limit(20)
      .lean();

    // Extract suggestions from titles and descriptions
    const suggestions = new Set<string>();

    videos.forEach((video) => {
      // Add full title if it contains the query
      if (video.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(video.title);
      }

      // Add words from title that start with the query
      const titleWords = video.title.split(/\s+/);
      titleWords.forEach((word: string) => {
        if (
          word.toLowerCase().startsWith(query.toLowerCase()) &&
          word.length > query.length
        ) {
          suggestions.add(word);
        }
      });
    });

    // Convert to array and limit results
    const suggestionArray = Array.from(suggestions).slice(0, 8);

    return NextResponse.json({ suggestions: suggestionArray });
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
