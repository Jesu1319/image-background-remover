import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported: JPG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${imageFile.type};base64,${base64}`;

    // Call Remove.bg API
    const removeBgApiKey = process.env.REMOVE_BG_API_KEY;
    
    if (!removeBgApiKey) {
      return NextResponse.json(
        { error: "Remove.bg API key not configured" },
        { status: 500 }
      );
    }

    const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": removeBgApiKey,
      },
      body: {
        image_file_b64: base64,
        size: "auto",
        format: "png",
      } as any,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      console.error("Remove.bg API error:", errorText);
      return NextResponse.json(
        { error: "Failed to process image" },
        { status: 500 }
      );
    }

    // Get the result as base64
    const resultBuffer = await removeBgResponse.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString("base64");

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${resultBase64}`,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


