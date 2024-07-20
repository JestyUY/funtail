"use server";

import { db } from "../db";
import { albums, images } from "../db/schema";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";

export async function deleteAlbum(albumId: string) {
  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      // 1. Fetch all picture records associated with the album
      const albumPictures = await tx
        .select()
        .from(images)
        .where(eq(images.albumId, albumId));

      // 2. Delete each picture from Vercel Blob storage
      for (const picture of albumPictures) {
        if (picture.optimizedUrl) {
          await del(picture.optimizedUrl);
        }
      }

      // 3. Delete all picture records associated with the album
      await tx.delete(images).where(eq(images.albumId, albumId));

      // 4. Delete the album record
      await tx.delete(albums).where(eq(albums.id, albumId));
    });

    return {
      success: true,
      message: "Album and associated pictures deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting album:", error);
    return { success: false, message: "Failed to delete album and pictures" };
  }
}
