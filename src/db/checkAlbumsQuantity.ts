"use server";

import { db } from "./index";
import { albums } from "./schema"; // Adjust the import path as needed
import { eq } from "drizzle-orm"; // Import the 'eq' function from the appropriate library

export async function checkAlbumQuantity(userId: string): Promise<any> {
  const albumQuantity = await db
    .select({ userId: albums.userId })
    .from(albums)
    .where(eq(albums.userId, userId));

  return albumQuantity.length;
}
