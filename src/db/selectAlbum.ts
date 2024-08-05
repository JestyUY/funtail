import { eq } from "drizzle-orm";
import { db } from "./index";
import { albums } from "./schema";

export async function selectAlbum(userId: string) {
  try {
    return await db.select().from(albums).where(eq(albums.userId, userId));
  } catch (error) {
    console.error("Error selecting albums:", error);
    throw error;
  }
}
