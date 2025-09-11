import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Return a simple redirect to a static image for now
    // We can implement dynamic image generation later if needed
    return NextResponse.redirect(new URL('/images/JumpStudyLogo.svg', request.url));
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new NextResponse("Failed to generate image", { status: 500 });
  }
}