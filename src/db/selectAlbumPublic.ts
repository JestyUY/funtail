import { eq } from "drizzle-orm";
import { db } from "./index";
import { albums, images } from "./schema";

export async function selectAlbumPublic(exportAlbumId: string) {
  try {
    const album = await db
      .select()
      .from(albums)
      .where(eq(albums.exportId, exportAlbumId))
      .limit(1);

    if (!album.length) {
      return null;
    }

    const albumImages = await db
      .select({
        optimizedUrl: images.optimizedUrl,
        altText: images.altText,
        tags: images.tags,
        size: images.size,
        width: images.width,
        height: images.height,
      })
      .from(images)
      .where(eq(images.albumId, album[0].id));

    return albumImages;
  } catch (error) {
    console.error("Error selecting album or images:", error);
    throw error;
  }
}
