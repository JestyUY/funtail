// app/components/AlbumCreatorDialog.tsx
"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react"; // Assuming you're using NextAuth for authentication
import Dialog from "./dialog-modal";
import { ImageCustomization } from "./image-customization";
import { analyzeImage } from "../utils/imageAnalysis";
import { saveToStorage } from "../utils/blobStorage";
import { ImageData, UserCustomization } from "../types/album";

export default function AlbumCreatorDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [albumName, setAlbumName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  // ... (keep existing handleFileChange, removeImage, handleAIAnalysis, and updateCustomization functions)

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
      // You might want to add some user feedback here, like a success message
    } catch (error) {
      console.error("Error saving album:", error);
      // Add error handling and user feedback here
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="border rounded-md border-indigo-200 p-1 bg-indigo-800 bg-opacity-5">
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
          {/* ... (keep existing file input and image preview code) */}
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => setIsOpen(false)} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Create Album</button>
        </div>
      </Dialog>
    </>
  );
}



/*
"use client";


import { useState, useRef } from "react";
import { useSession } from "next-auth/react"; // Assuming you're using NextAuth for authentication
import Dialog from "./dialog-modal";
import { ImageCustomization } from "./image-customization";
import { analyzeImage } from "../utils/imageAnalysis";
import { saveToStorage } from "../utils/blobStorage";
import { ImageData, UserCustomization } from "../types/album";

export default function AlbumCreatorDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [albumName, setAlbumName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: ImageData[] = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prevImages => {
        const updatedImages = [...prevImages, ...newImages];
        return updatedImages.slice(0, 20); // Limit to 20 images
      });
    }
  };

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
      // You might want to add some user feedback here, like a success message
    } catch (error) {
      console.error("Error saving album:", error);
      // Add error handling and user feedback here
    }
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  return (
    <>
      <header className="text-white flex w-full justify-between px-10 py-2">
        <div></div>
        <button onClick={() => setIsOpen(true)} className="border rounded-md border-indigo-200 p-1 bg-indigo-800 bg-opacity-5">
          New Album
        </button>
      </header>

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
          <div className="p-2 border border-dashed border-indigo-300 rounded-md">
          
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md"
            >
              Upload Images (Max 20)
            </button>
            <div className="mt-2 space-y-2">
              {images.map((image, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <img src={image.preview} alt={`Preview ${index}`} className="w-20 h-20 object-cover" />
                  <span>{image.file.name}</span>
                  <button onClick={() => removeImage(index)} className="text-red-500">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => setIsOpen(false)} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md">Create Album</button>
        </div>
      </Dialog>
    </>
  );
}
*/