"use server";

import { auth } from "@/lib/auth";
import { selectAlbum } from "@/src/db/selectAlbum";
import { selectPicturesByAlbumId } from "@/src/db/selectPicturedByAlbumId";
import { Album, mergedImage } from "../../app/types/album";

export async function fetchAlbums(userId: string): Promise<Album[]> {
  const session = await auth();
  if (!session || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  const albums = await selectAlbum(userId);
  const albumsWithPictures: Album[] = await Promise.all(
    albums.map(async (album) => {
      const pictures: mergedImage[] = await selectPicturesByAlbumId(album.id);
      return { ...album, pictures };
    })
  );

  return albumsWithPictures;
}
