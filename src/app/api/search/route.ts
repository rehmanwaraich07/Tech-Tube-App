import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Clean and prepare search terms
    const searchTerms = query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((term) => term.length > 0);

    if (searchTerms.length === 0) {
      return NextResponse.json([]);
    }

    // Build comprehensive search query
    const searchConditions = [];

    // 1. Exact phrase match (highest priority)
    searchConditions.push({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    // 2. All words present (any order)
    const allWordsConditions = searchTerms.map((term) => ({
      $or: [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { "uploadedBy.name": { $regex: term, $options: "i" } },
        { "uploadedBy.email": { $regex: term, $options: "i" } },
      ],
    }));

    searchConditions.push({ $and: allWordsConditions });

    // 3. Any word present (partial matches)
    searchConditions.push({
      $or: searchTerms.flatMap((term) => [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { "uploadedBy.name": { $regex: term, $options: "i" } },
        { "uploadedBy.email": { $regex: term, $options: "i" } },
      ]),
    });

    // 4. Fuzzy matching for typos (using word boundaries)
    const fuzzyConditions = searchTerms
      .map((term) => {
        if (term.length > 3) {
          // For longer terms, allow some character variations
          const fuzzyPattern = term.split("").join(".*?");
          return {
            $or: [
              { title: { $regex: fuzzyPattern, $options: "i" } },
              { description: { $regex: fuzzyPattern, $options: "i" } },
            ],
          };
        }
        return null;
      })
      .filter(Boolean);

    if (fuzzyConditions.length > 0) {
      searchConditions.push({ $or: fuzzyConditions });
    }

    // Execute search with all conditions
    const videos = await Video.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { "uploadedBy.name": { $regex: query, $options: "i" } },
        { "uploadedBy.email": { $regex: query, $options: "i" } },
      ],
    })
      .sort({
        // Sort by relevance: newer videos and higher views first
        views: -1,
        createdAt: -1,
      })
      .limit(100)
      .lean();

    // Score and sort results by relevance
    const scoredVideos = videos.map((video) => {
      let score = 0;
      const title = (video.title || "").toLowerCase();
      const description = (video.description || "").toLowerCase();
      const uploaderName = (video.uploadedBy?.name || "").toLowerCase();
      const uploaderEmail = (video.uploadedBy?.email || "").toLowerCase();

      // Exact phrase match in title (highest score)
      if (title.includes(query.toLowerCase())) {
        score += 100;
      }

      // Exact phrase match in description
      if (description.includes(query.toLowerCase())) {
        score += 50;
      }

      // Title starts with query
      if (title.startsWith(query.toLowerCase())) {
        score += 80;
      }

      // All search terms present in title
      const titleWordsMatch = searchTerms.every((term) => title.includes(term));
      if (titleWordsMatch) {
        score += 60;
      }

      // All search terms present in description
      const descWordsMatch = searchTerms.every((term) =>
        description.includes(term)
      );
      if (descWordsMatch) {
        score += 30;
      }

      // Individual word matches in title
      searchTerms.forEach((term) => {
        if (title.includes(term)) score += 20;
        if (description.includes(term)) score += 10;
        if (uploaderName.includes(term)) score += 15;
        if (uploaderEmail.includes(term)) score += 5;
      });

      // Boost score based on video popularity
      score += Math.min((video.views || 0) / 100, 20);

      // Boost newer videos slightly
      const daysSinceUpload =
        (Date.now() - new Date(video.createdAt || 0).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSinceUpload < 7) score += 10;
      else if (daysSinceUpload < 30) score += 5;

      return { ...video, relevanceScore: score };
    });

    // Sort by relevance score and remove duplicates
    const uniqueVideos = scoredVideos
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .filter(
        (video, index, array) =>
          array.findIndex(
            (v) => (v as any)._id.toString() === (video as any)._id.toString()
          ) === index
      )
      .slice(0, 50); // Limit to top 50 results

    // Remove the relevanceScore before sending response
    const finalResults = uniqueVideos.map(
      ({ relevanceScore, ...video }) => video
    );

    console.log(
      `Search for "${query}" returned ${finalResults.length} results`
    );

    return NextResponse.json(finalResults);
  } catch (error) {
    console.error("Error searching videos:", error);
    return NextResponse.json(
      { error: "Failed to search videos" },
      { status: 500 }
    );
  }
}
