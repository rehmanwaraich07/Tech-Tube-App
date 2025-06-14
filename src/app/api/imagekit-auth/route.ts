import { NextResponse } from "next/server";
import ImageKit from "imagekit";

export async function GET() {
  try {
    if (
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.NEXT_PUBLIC_URL_ENDPOINT
    ) {
      console.error("Missing ImageKit environment variables");
      return NextResponse.json(
        { error: "ImageKit configuration missing" },
        { status: 500 }
      );
    }

    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
    });

    const auth = imagekit.getAuthenticationParameters();
    return NextResponse.json(auth);
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "Failed to generate authentication" },
      { status: 500 }
    );
  }
}
