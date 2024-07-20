"use server";

import { db } from "../db";
import { images } from "../db/schema";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";

export async function deleteImage(imageId: string) {
  try {
    const result = await db.transaction(async (tx) => {
      const [deletedImage] = await tx
        .delete(images)
        .where(eq(images.id, imageId))
        .returning();

      if (!deletedImage) {
        throw new Error("Image not found");
      }

      // Assuming you store the full blob URL in the optimizedUrl field
      await del(deletedImage.optimizedUrl);

      return deletedImage;
    });

    return {
      success: true,
      message: "Image deleted successfully",
      deletedImage: result,
    };
  } catch (error) {
    console.error("Error deleting the image:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete the image",
    };
  }
}
