"use server";

import { db } from "./index";
import { albums } from "./schema";

export async function createAlbum(albumInfo: {
  albumName: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}): Promise<any> {
  const insertedAlbum = await db
    .insert(albums)
    .values({
      name: albumInfo.albumName,
      ...albumInfo,
    })
    .returning();
  return insertedAlbum;
}
