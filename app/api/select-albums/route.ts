import { NextRequest, NextResponse } from "next/server";
import { selectAlbum } from "../../../src/db/selectAlbum";
import { auth } from "@/lib/auth";
import { selectPicturesByAlbumId } from "@/src/db/selectPicturedByAlbumId";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId || userId !== session.user.id) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  try {
    const albums = await selectAlbum(userId);

    const albumsWithPictures = await Promise.all(
      albums.map(async (album) => {
        const pictures = await selectPicturesByAlbumId(album.id);
        return {
          ...album,
          pictures,
        };
      })
    );

    return NextResponse.json({ albums: albumsWithPictures });
  } catch (error) {
    console.error("Error fetching albums:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
