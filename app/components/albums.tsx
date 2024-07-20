"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Album } from "../types/album";
import AlbumCreatorDialog from "./album-creator-dialog";
import AlbumDetailed from "./album-detailed";
import { fetchAlbums } from "../../src/actions/albumActions";

export default function Albums({ userId }: { userId: string }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const fetchAlbumsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAlbums: Album[] = await fetchAlbums(userId);
      setAlbums(fetchedAlbums);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAlbumsData();
  }, [fetchAlbumsData]);

  const openModalWithAlbum = useCallback((album: Album) => {
    setSelectedAlbum(album);
    setIsOpen(true);
  }, []);

  const handleAlbumCreated = useCallback(() => {
    fetchAlbumsData();
  }, [fetchAlbumsData]);

  const handleAlbumDeleted = useCallback((deletedAlbumId: string) => {
    setAlbums((prevAlbums) =>
      prevAlbums.filter((album) => album.id !== deletedAlbumId)
    );
  }, []);

  const sortedAlbums = useMemo(
    () =>
      [...albums].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return 0;
      }),
    [albums]
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="flex flex-wrap gap-3 justify-center w-full h-full">
      <AlbumCreatorDialog userId={userId} onAlbumCreated={handleAlbumCreated} />
      <AlbumDetailed
        isOpen={isOpen}
        handleClose={handleClose}
        album={selectedAlbum}
        handleAlbumDeleted={handleAlbumDeleted}
      />

      {sortedAlbums.map((album) => (
        <div
          key={album.id}
          className="border-2 rounded-md flex flex-col w-[300px] h-[300px] items-center hover:cursor-pointer relative"
          onClick={() => openModalWithAlbum(album)}
        >
          {album.pictures && album.pictures[0] && (
            <img
              className="object-cover w-full h-full rounded-md absolute"
              src={album.pictures[0].optimizedUrl}
              alt={album.pictures[0].altText ?? ""}
            />
          )}
          <div className="w-full h-full bg-gradient-to-t from-black to-transparent absolute">
            <span className="text-xl text-java-200 mt-4 z-1 absolute bottom-5 w-full text-center">
              {album.name}
            </span>
          </div>
        </div>
      ))}
    </main>
  );
}
