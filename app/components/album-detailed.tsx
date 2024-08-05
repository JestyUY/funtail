"use client";

import { useEffect, useState, useRef } from "react";
import { Album } from "../types/album";
import CopyIcon from "./svg-components/copy";
import { deleteAlbum } from "@/src/actions/deleteAlbum";
import { deleteImage } from "@/src/actions/deleteImage";

type CopyState = {
  url?: boolean;
  alt?: boolean;
  tags?: boolean;
};

type CopyStates = Record<string, CopyState>;

interface albumProps {
  isOpen: boolean;
  handleClose: () => void;
  album: Album | null;
  handleAlbumDeleted: (albumId: string) => void;
  handleDeleteImage: (albumId: string, imageId: string) => void;
}

export default function AlbumDetailed({
  isOpen,
  handleClose,
  album,
  handleAlbumDeleted,
  handleDeleteImage,
}: albumProps) {
  const [copyStates, setCopyStates] = useState<CopyStates>({});
  const [deletingImages, setDeletingImages] = useState<Record<string, boolean>>(
    {}
  );
  const [isDeletingAlbum, setIsDeletingAlbum] = useState(false);
  const [isSecretIdVisible, setIsSecretIdVisible] = useState(false);
  const [isSecretIdCopied, setIsSecretIdCopied] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleCopy = (
    pictureId: string,
    field: keyof CopyState,
    text: string
  ) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStates((prev) => ({
        ...prev,
        [pictureId]: {
          ...prev[pictureId],
          [field]: true,
        },
      }));
      setTimeout(() => {
        setCopyStates((prev) => ({
          ...prev,
          [pictureId]: {
            ...prev[pictureId],
            [field]: false,
          },
        }));
      }, 3000);
    });
  };

  const toggleSecretId = () => {
    setIsSecretIdVisible(!isSecretIdVisible);
  };

  const copySecretId = () => {
    if (album?.exportId) {
      navigator.clipboard
        .writeText(album.exportId)
        .then(() => {
          setIsSecretIdCopied(true);
          setTimeout(() => setIsSecretIdCopied(false), 3000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
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
      setIsDeletingAlbum(true);
      try {
        const result = await deleteAlbum(album.id);
        if (result.success) {
          handleClose();
          handleAlbumDeleted(album.id);
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error("Album deletion failed:", error);
        alert("An error occurred while deleting the album.");
      } finally {
        setIsDeletingAlbum(false);
      }
    }
  };

  const handleDeleteImages = async (imageId: string) => {
    setDeletingImages((prev) => ({ ...prev, [imageId]: true }));
    try {
      const result = await deleteImage(imageId);
      if (result.success) {
        if (album?.pictures?.length === 1) {
          handleDeleteAlbum();
        } else if (album) {
          handleDeleteImage(album.id, imageId);
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("An error occurred while deleting the image.");
    } finally {
      setDeletingImages((prev) => ({ ...prev, [imageId]: false }));
    }
  };

  return (
    <>
      {isOpen && (
        <div className="w-full h-screen fixed inset-0  bg-gray-900 bg-opacity-20 z-30 flex items-start justify-center overflow-hidden ">
          <main
            ref={modalRef}
            className=" max-h-[90vh] bg-gray-900
             overflow-y-auto p-4 rounded-lg  mt-[4%]"
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <aside className="flex gap-4 items-center text-java-50 justify-between px-2 mb-7 py-3">
              <h2 className="text-xl  text-java-100 ">
                Album:{" "}
                <span className="font-bold text-2xl  ">{album?.name}</span>
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-java-100">
                  secret id:{" "}
                  <span
                    onClick={toggleSecretId}
                    className="cursor-pointer border rounded-md p-1 text-java-200 border-java-800"
                  >
                    {isSecretIdVisible
                      ? album?.exportId
                      : album?.exportId?.substring(0, 4) +
                        "*".repeat(
                          (album?.exportId?.length &&
                            album?.exportId?.length - 4) ||
                            0
                        )}
                  </span>
                </p>
                <span onClick={copySecretId}>
                  <CopyIcon isCopied={isSecretIdCopied} />
                </span>
              </div>

              <button
                className={`text-red-600 bg-white bg-opacity-80 border p-1 w-40 rounded-md ${
                  isDeletingAlbum
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-red-600 hover:text-white"
                }`}
                onClick={handleDeleteAlbum}
                disabled={isDeletingAlbum}
              >
                {isDeletingAlbum ? "Deleting..." : "Remove Album"}
              </button>
            </aside>
            <div className="border border-gray-600 rounded-md bg-gray-800 text-java-50 p-4 my-4">
              <p className="mb-2 text-java-200">
                Note: With this secret ID, you can fetch this album:
              </p>
              <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto">
                <code className="text-java-100">
                  fetch(
                  <span className="text-green-400">
                    &quot;/api/get-album?secretId=your-secret-id&quot;
                  </span>
                  )
                </code>
              </pre>
              <p className="mt-4 text-java-200">Example:</p>
              <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto">
                <code className="text-java-100">
                  localhost:3000/api/get-album?secretId=
                  <span className="text-green-400">
                    f001705a-18e4-42d3-9cf0-b29bd8a8845a
                  </span>
                </code>
              </pre>
            </div>
            <ul className="flex flex-col gap-4 max-w-screen-xl mx-auto">
              {album?.pictures &&
                album.pictures.map((picture) => (
                  <li
                    key={picture.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-1/3">
                        <img
                          src={picture.optimizedUrl}
                          alt={picture.altText ?? ""}
                          className="w-full h-48 sm:h-full object-cover"
                        />
                        <span className="absolute bottom-2 right-2 bg-green-600 text-java-200 text-xs font-bold h-10 w-10 text-center rounded-full flex items-center justify-center">
                          {picture.size && Math.floor(picture.size / 1000)} kb
                        </span>
                      </div>
                      <div className="p-4 flex-grow">
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            {
                              label: "URL",
                              value: picture.optimizedUrl,
                              key: "url",
                            },
                            {
                              label: "Alt Text",
                              value: picture.altText,
                              key: "alt",
                            },
                            { label: "Tags", value: picture.tags, key: "tags" },
                            {
                              label: "Size",
                              value: `${picture.width}x${picture.height}px`,
                            },
                          ].map((item) => (
                            <div key={item.label} className="flex flex-col">
                              <span className="text-java-300 text-sm font-medium mb-1">
                                {item.label}:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-java-100 bg-gray-700 px-2 py-1 rounded text-sm break-all flex-grow">
                                  {item.value || "N/A"}
                                </span>
                                {item.key && (
                                  <span
                                    onClick={() =>
                                      handleCopy(
                                        picture.id,
                                        item.key as keyof CopyState,
                                        item.value || ""
                                      )
                                    }
                                    className="cursor-pointer"
                                  >
                                    <CopyIcon
                                      isCopied={
                                        copyStates[picture.id]?.[
                                          item.key as keyof CopyState
                                        ] || false
                                      }
                                    />
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-900 px-4 py-3 flex justify-end">
                      <button
                        className={`px-3 py-1 rounded-md text-sm transition-colors duration-300 ${
                          deletingImages[picture.id]
                            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                        onClick={() => handleDeleteImages(picture.id)}
                        disabled={deletingImages[picture.id]}
                      >
                        {deletingImages[picture.id]
                          ? "Deleting..."
                          : "Remove image"}
                      </button>
                    </div>
                  </li>
                ))}
            </ul>

            <button
              className="bg-java-600 text-white px-4 py-2 rounded-md mt-2"
              onClick={handleClose}
            >
              Close me
            </button>
          </main>
        </div>
      )}
    </>
  );
}
