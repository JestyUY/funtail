"use client";

import { useEffect, useState, useRef } from "react";
import { Album } from "../types/album";
import CopyIcon from "./svg-components/copy";
import { deleteAlbum } from "@/src/actions/deleteAlbum";
import { deleteImage } from "@/src/actions/deleteImage";

export default function AlbumDetailed({
  isOpen,
  handleClose,
  album,
  handleAlbumDeleted,
  handleDeleteImage,
}: {
  isOpen: boolean;
  handleClose: () => void;
  album?: Album | null;
  handleAlbumDeleted: (albumId: string) => void;
  handleDeleteImage: (albumId: string, imageId: string) => void;
}) {
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleCopy = (pictureId: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopyStates((prev) => ({ ...prev, [pictureId]: true }));
      setTimeout(() => {
        setCopyStates((prev) => ({ ...prev, [pictureId]: false }));
      }, 3000); // Reset after 2 seconds
    });
  };
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClose]);

  const handleDeleteAlbum = async () => {
    if (album && album.id) {
      const result = await deleteAlbum(album.id);
      if (result.success) {
        handleClose();
        handleAlbumDeleted(album.id);
      } else {
        alert(result.message);
      }
    }
  };
  const handleDeleteImages = async (imageId: string) => {
    console.log("Deleting image:", imageId); // Debug log
    const result = await deleteImage(imageId);
    if (result.success) {
      console.log("Delete successful"); // Debug log
      if (album?.pictures?.length === 1) {
        handleDeleteAlbum();
      } else {
        // Call the prop function to update parent state
        if (album) {
          handleDeleteImage(album.id, imageId);
        }
      }
    } else {
      console.error("Delete failed:", result.message); // Debug log
      alert(result.message);
    }
  };
  return (
    <>
      {isOpen && (
        <div className="w-full h-full absolute top-0 bg-java-50 bg-opacity-20 z-30">
          <main ref={modalRef} className="w-[90%] bg-java-50 m-auto mt-[5%]">
            <ul className="flex flex-col">
              <button className="text-red-600 " onClick={handleDeleteAlbum}>
                Remove
              </button>
              {album?.pictures &&
                album.pictures.map((picture) => (
                  <li
                    key={picture.id}
                    className="w-full min-h-40 flex p-2  items-center"
                  >
                    <img
                      src={picture.optimizedUrl}
                      alt={picture.altText ?? ""}
                      className="h-40 w-40 object-cover rounded-md m-2"
                    />
                    <div className="flex flex-col items-start gap-2">
                      <span className="text-sm flex items-center gap-1">
                        url:{" "}
                        <span className="border rounded-md p-1">
                          {picture.optimizedUrl}{" "}
                        </span>
                        <span
                          onClick={() =>
                            handleCopy(picture.id, picture.optimizedUrl)
                          }
                        >
                          <CopyIcon
                            isCopied={copyStates[picture.id] || false}
                          />
                        </span>
                      </span>
                      <span className="text-sm border rounded-md p-1 inline-block">
                        alt: {picture.altText}
                      </span>
                      <span className="text-sm border rounded-md p-1 inline-block">
                        Tags: {picture.tags}
                      </span>
                      <span className="text-sm border rounded-md p-1 inline-block">
                        Height: {picture.height}px Width: {picture.width}px
                      </span>
                      <span className="text-sm border rounded-md p-1 inline-block">
                        size: {picture.size && Math.floor(picture.size / 1000)}
                        kb
                      </span>
                    </div>
                    <button onClick={() => handleDeleteImages(picture.id)}>
                      Remove image
                    </button>
                  </li>
                ))}
            </ul>

            <button onClick={handleClose}>Close me</button>
          </main>
        </div>
      )}
    </>
  );
}
