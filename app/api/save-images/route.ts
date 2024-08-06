import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { saveImageInfoToDatabase } from "../../../src/db/saveImageInfoToDatabase";
import { createAlbum } from "@/src/db/createAlbum";

export async function POST(req: NextRequest) {
  try {
    const { albumName, images, albumId, userId } = await req.json();
    if (!albumName) {
      throw new Error("albumName is required");
    }
    if (!userId) {
      throw new Error("userId is required");
    }

    const createdAlbum = await createAlbum({
      albumName,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
    });
    console.log("Created Album:", createdAlbum);
    const newAlbumId = await createdAlbum[0].id;
    console.log(newAlbumId);
    const savedImages = await Promise.all(
      images.map(async (image: any) => {
        const { data, suggestions, albumId } = image;

        if (!newAlbumId) {
          throw new Error("albumId is required for each image.");
        }
        const buffer = Buffer.from(data.split(",")[1], "base64");
        const optimizedBuffer = await sharp(buffer)
          .resize(suggestions.size.width, suggestions.size.height)
          .rotate(suggestions.rotation)
          .grayscale(suggestions.grayscale)
          .toFormat(suggestions.format.toLowerCase(), {
            quality: suggestions.quality,
            compressionLevel: suggestions.compressionLevel,
          })
          .toBuffer();

        // Upload to Vercel Blob
        const { url } = await put(
          `${albumName}-${Date.now()}.${suggestions.format.toLowerCase()}`,
          optimizedBuffer,
          {
            access: "public",
          }
        );
        try {
          await saveImageInfoToDatabase({
            albumId: newAlbumId,
            optimizedUrl: url,
            altText: suggestions.altText,
            tags: suggestions.tags.join(","),
            size: optimizedBuffer.length,
            width: suggestions.size.width,
            height: suggestions.size.height,
            format: suggestions.format,
            quality: suggestions.quality,
            rotation: suggestions.rotation,
            compressionLevel: suggestions.compressionLevel,
            grayscale: suggestions.grayscale,
          });
          console.log("Image info saved to database");
        } catch (error) {
          console.error("Error saving image info:", error);
        }

        return { url, suggestions };
      })
    );

    return NextResponse.json(savedImages);
  } catch (error) {
    console.error("Error processing images:", error);
    return NextResponse.json(
      { error: "Failed to process images" },
      { status: 500 }
    );
  }
}
