// app/components/AlbumCreatorDialog.tsx
"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react"; // Assuming you're using NextAuth for authentication
import Dialog from "./dialog-modal";

import { saveToStorage } from "../utils/blobStorage";
import { ImageData } from "../types/album";

export default function AlbumCreatorDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [albumName, setAlbumName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const handleSave = async () => {
    if (!session?.user?.id) {
      console.error("User not authenticated");
      return;
    }

    try {
      const newAlbum = await saveToStorage(albumName, session.user.id, images);
      console.log("Album created:", newAlbum);
      setIsOpen(false);
      setImages([]);
      setAlbumName("");
    } catch (error) {
      console.error("Error saving album:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="border rounded-md border-indigo-200 p-1 bg-indigo-800 bg-opacity-5"
      >
        New Album
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="New Album"
      >
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            className="border border-indigo-900 p-2 rounded-md"
            placeholder="Album Name"
          />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => setIsOpen(false)}
            className="bg-gray-300 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md"
          >
            Create Album
          </button>
        </div>
      </Dialog>
    </>
  );
}
