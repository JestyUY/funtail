"use client";

import { auth } from "@/lib/auth";
import AlbumCreatorDialog from "./album-creator-dialog";
import { selectAlbum } from "@/src/db/selectAlbum";
import { useEffect, useState } from "react";
import { Album } from "../types/album";

export default function Albums({ userId }: { userId: string }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchAlbums() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/select-albums?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch albums");
        }
        const data = await response.json();
        setAlbums(data);
        console.log(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlbums();
  }, [userId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <main className=" flex flex-wrap gap-3 justify-center">
      <AlbumCreatorDialog userId={userId} />

      {albums.map((album, index) => (
        <div
          key={index}
          className="border-2 rounded-md flex flex-col w-[300px] h-[300px] items-center bg-java-700 border-java-800 hover:cursor-pointer"
        >
          <span className="text-2xl text-java-200 mt-4">{album.name}</span>
        </div>
      ))}
    </main>
  );
}
