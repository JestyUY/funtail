import { eq } from "drizzle-orm";
import { db } from "./index";
import { images } from "./schema";

export async function selectPicturesByAlbumId(albumId: string) {
  try {
    return await db.select().from(images).where(eq(images.albumId, albumId));
  } catch (error) {
    console.error("Error selecting pictures:", error);
    throw error;
  }
}
