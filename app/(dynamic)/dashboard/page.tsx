import Dialog from "@/app/components/dialog-modal";
import AlbumCreatorDialog from "@/app/components/album-creator-dialog";
import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";
import Albums from "@/app/components/albums";
import { selectAlbum } from "@/src/db/selectAlbum";
import { selectPicturesByAlbumId } from "@/src/db/selectPicturedByAlbumId";

export default async function Page() {
  const session = await auth();
  if (!session) {
    redirect("/signin-auto");
  }
  const albums = await selectAlbum(session.user.id);

  // Map over albums to add pictures to each album
  const albumsWithPictures = await Promise.all(
    albums.map(async (album) => {
      const pictures = await selectPicturesByAlbumId(album.id);
      return {
        ...album,
        pictures,
      };
    })
  );

  return (
    <main className="flex flex-col p-8 w-full h-screen overflow-auto pt-24 ">
      <Albums userId={session.user.id} />
    </main>
  );
}
