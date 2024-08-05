"use client";

import { useState, useRef } from "react";
import Dialog from "./dialog-modal";
import { optimizeImage, sendChunk } from "../../src/actions/optimizeImage"; // Adjust this import path as needed
import { checkAlbumQuantity } from "@/src/db/checkAlbumsQuantity";

// Type definitions
interface UserCustomization {
  // Define properties as needed
}
interface Size {
  width: number;
  height: number;
}

interface AISuggestions {
  altText: string;
  tags: string[];
  size: Size;
  format: string;
  quality: number;
  rotation: number;
  compressionLevel: number;
  grayscale: boolean;
}

interface ImageData {
  file: File;
  preview: string;
  aiSuggestions?: AISuggestions;
  userCustomization?: UserCustomization;
}
interface AlbumCreatorDialogProps {
  userId: string;
  onAlbumCreated: () => void;
}

export default function AlbumCreatorDialog({
  userId,
  onAlbumCreated,
}: AlbumCreatorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [optimized, setOptimized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOptimizeImages = async () => {
    // Convert blob URLs to base64
    const imageData = await Promise.all(
      images.map(async (img) => {
        const response = await fetch(img.preview);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
    );

    const prompt = `
      Analyze this specific image in detail and provide optimized settings for web use. Consider the following aspects:
      
      1. Image Content: Describe the main subject and key elements of the image short answer Max characters 15
      
      2. Dimensions: 
         - keeping the aspect ratio intact, recommend ideal dimensions width and height for web display keeping the Aspect Ratio intact
         
      3. Image Format:
         - Recommend the best format (webP, PNG or JPG) for a minimum file size and optimal visual quality
         
      4. Quality and Compression:
         - Suggest an optimal quality setting (0-100)
         - Recommend a compression level (1-9) if applicable
         
      5. Color Treatment:
         - Analyze the current color scheme
         - Would grayscale be beneficial? Why or why not?
         - Any other color optimizations?
      
      6. Orientation:
         - Is the image correctly oriented?
         - If not, suggest rotation in degrees
      
      7. Accessibility:
         - Provide a relevant and descriptive alt text (max characters) for accessibility purposes 
         - Explain key elements that should be conveyed in the alt text
      
      8. Categorization:
         - Suggest up to 5 relevant tags based on the image content
         - Explain why each tag is relevant
      
      9. Special Considerations:
         - Any unique characteristics of this image that affect optimization?
         - Are there any areas of the image that require special attention for web display?
      
      Prioritize web performance while maintaining good visual quality. Provide a brief explanation for each of your recommendations, focusing on how they relate to this specific image.
    `;

    try {
      // Process each image individually and gather suggestions
      const imageSuggestions = await Promise.all(
        images.map(async (image) => {
          // Convert blob URL to base64
          const response = await fetch(image.preview);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          // Split the base64 string into chunks
          const chunkSize = 3 * 1024 * 1024; // 3MB chunks
          const chunks = [];
          for (let i = 0; i < base64.length; i += chunkSize) {
            chunks.push(base64.slice(i, i + chunkSize));
          }

          // Send chunks to server
          for (let i = 0; i < chunks.length; i++) {
            await sendChunk(chunks[i], i, chunks.length, prompt, userId);
          }

          // Call server action for optimization
          const suggestion = await optimizeImage(prompt, userId);

          // Ensure the size property is correctly typed
          const typedSuggestion: AISuggestions = {
            ...suggestion,
            size: {
              width:
                typeof (suggestion.size as { width: number }).width === "number"
                  ? (suggestion.size as { width: number }).width
                  : 0,
              height:
                typeof (suggestion.size as { height: number }).height ===
                "number"
                  ? (suggestion.size as { height: number }).height
                  : 0,
            },
            quality:
              typeof suggestion.quality === "number" ? suggestion.quality : 0,
            rotation:
              typeof suggestion.rotation === "number" ? suggestion.rotation : 0,
            compressionLevel:
              typeof suggestion.compressionLevel === "number"
                ? suggestion.compressionLevel
                : 0,
            grayscale:
              typeof suggestion.grayscale === "boolean"
                ? suggestion.grayscale
                : false,
            altText:
              typeof suggestion.altText === "string" ? suggestion.altText : "",
            format:
              typeof suggestion.format === "string" ? suggestion.format : "",
            tags: Array.isArray(suggestion.tags) ? suggestion.tags : [],
          };

          return {
            ...image,
            aiSuggestions: typedSuggestion,
          };
        })
      );

      // Update state with optimized images
      setImages(imageSuggestions);
      setOptimized(true);
    } catch (error) {
      console.error("Error optimizing images:", error);
      if (error instanceof Error) {
        switch (error.message) {
          case "Unauthorized":
            setError("Unauthorized: Please log in to continue.");
            break;
          case "You have reached the limit of optimizations":
            setError("You have reached the limit of optimizations.");
            break;
          case "Invalid input data":
            setError("Invalid input data.");
            break;
          default:
            setError("An error occurred while processing your request.");
        }
      } else {
        setError("An unexpected error occurred .");
      }
    }
  };
  const saveImages = async () => {
    const albumId = crypto.randomUUID();

    const imagesToSave = await Promise.all(
      images.map(async (img) => {
        const response = await fetch(img.preview);
        const blob = await response.blob();
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        return {
          data,
          suggestions: img.aiSuggestions,
          albumId,
        };
      })
    );

    try {
      const response = await fetch("/api/save-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumName,
          images: imagesToSave,
          albumId,
          userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to save images");
      if (response.ok) onAlbumCreated();
      const savedImages = await response.json();
      console.log("Images saved successfully", savedImages);
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving images:", error);
      setError("Failed to save images. Please try again.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: ImageData[] = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prevImages) => {
        const updatedImages = [...prevImages, ...newImages];
        return updatedImages.slice(0, 20); // Limit to 20 images
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleCancelClick = () => {
    setImages([]);
    setIsOpen(false);
    setOptimized(false);
    setAlbumName("");
    setError(null);
  };

  const handleNewAlbum = async () => {
    const albumQuantity = await checkAlbumQuantity(userId);

    if (albumQuantity >= 5) {
      setError("You have reached the maximum number of albums allowed.");
      return;
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleNewAlbum}
        className="border-2 rounded-md flex flex-col w-[300px] h-[300px] items-center bg-java-700 border-java-800 hover:cursor-pointer"
      >
        <span className="text- text-java-200 mt-4">New Album</span>
        <span className="text-[150px] text-java-200">+</span>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="New Album"
      >
        <div className="flex flex-col space-y-4">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              className="border border-java-900 p-2 rounded-md w-[300px]"
              placeholder="Album Name"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)} // Update albumName state on input change
            />
            {!albumName ? (
              <span className="text-red-500">Requiered*</span>
            ) : null}
            {error && <span className="text-red-500">{error}</span>}
          </div>
          <div className="p-2 border border-dashed border-java-300 rounded-md min-h-36">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />

            <div className="mt-2 space-y-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex items-center hover:bg-gray-800 w-full group text-java-50 "
                >
                  <div className="flex items-center space-x-2 ">
                    <img
                      src={image.preview}
                      alt={`Preview ${index}`}
                      className="w-20 h-20 object-cover"
                    />
                    <span className="text-sm w-[30ch] ">
                      {image.file.name.slice(0, 60)}
                      {image.file.name.length > 60 && "..."}
                    </span>
                  </div>
                  <div className="px-2 flex flex-col ">
                    <div className="w-32  flex justify-between  ">
                      <label className="" htmlFor="width">
                        width:
                      </label>
                      <input
                        className="w-16 group-hover:bg-gray-700 bg-gray-800 "
                        type="number"
                        name="width"
                        id=""
                        min={240}
                        max={1920}
                        value={image.aiSuggestions?.size.width || ""}
                        onChange={(e) => {
                          const width = Number(e.target.value);
                          setImages((prev: ImageData[]) =>
                            prev.map((img, idx) => {
                              if (idx === index) {
                                return {
                                  ...img,
                                  aiSuggestions: {
                                    ...img.aiSuggestions,
                                    size: {
                                      ...img.aiSuggestions?.size,
                                      width: width,
                                    },
                                  },
                                } as ImageData; // Explicitly cast to ImageData
                              }
                              return img;
                            })
                          );
                        }}
                      />
                    </div>
                    <div className="w-32  flex justify-between ">
                      <label htmlFor="height">height:</label>
                      <input
                        className="w-16 group-hover:bg-gray-700 bg-gray-800 "
                        type="number"
                        name="height"
                        id=""
                        min={240}
                        max={1920}
                        value={image.aiSuggestions?.size.height || ""}
                        onChange={(e) => {
                          const height = Number(e.target.value);
                          setImages((prev: ImageData[]) =>
                            prev.map((img, idx) => {
                              if (idx === index && img.aiSuggestions) {
                                return {
                                  ...img,
                                  aiSuggestions: {
                                    ...img.aiSuggestions,
                                    size: {
                                      ...img.aiSuggestions.size,
                                      height: height,
                                    },
                                  },
                                } as ImageData;
                              }
                              return img;
                            })
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-44 ">
                    <div className="flex justify-between">
                      <label htmlFor="quality">Quality:</label>
                      <input
                        className="w-16 group-hover:bg-gray-700 bg-gray-800 "
                        type="number"
                        name="quality"
                        id=""
                        min={0}
                        max={100}
                        value={image.aiSuggestions?.quality || ""}
                        onChange={(e) => {
                          const quality = Number(e.target.value);
                          setImages((prev: ImageData[]) =>
                            prev.map((img, idx) => {
                              if (idx === index && img.aiSuggestions) {
                                return {
                                  ...img,
                                  aiSuggestions: {
                                    ...img.aiSuggestions,
                                    quality: quality,
                                  },
                                } as ImageData;
                              }
                              return img;
                            })
                          );
                        }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <label htmlFor="compression">Compression:</label>
                      <input
                        className="w-16 group-hover:bg-gray-700 bg-gray-800 "
                        type="number"
                        name="compression"
                        id=""
                        min={1}
                        max={9}
                        value={image.aiSuggestions?.compressionLevel || ""}
                        onChange={(e) => {
                          const compressionLevel = Number(e.target.value);
                          setImages((prev: ImageData[]) =>
                            prev.map((img, idx) => {
                              if (idx === index && img.aiSuggestions) {
                                return {
                                  ...img,
                                  aiSuggestions: {
                                    ...img.aiSuggestions,
                                    compressionLevel: compressionLevel,
                                  },
                                } as ImageData;
                              }
                              return img;
                            })
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-48 pl-3">
                    <label htmlFor="grayscale">Grayscale:</label>
                    <input
                      className="w-16 group-hover:bg-gray-700 bg-gray-800 "
                      type="checkbox"
                      name="grayscale"
                      id=""
                      checked={image.aiSuggestions?.grayscale}
                      onChange={(e) => {
                        const grayscale = e.target.checked;
                        setImages((prev: ImageData[]) =>
                          prev.map((img, idx) => {
                            if (idx === index && img.aiSuggestions) {
                              return {
                                ...img,
                                aiSuggestions: {
                                  ...img.aiSuggestions,
                                  grayscale: grayscale,
                                },
                              } as ImageData;
                            }
                            return img;
                          })
                        );
                      }}
                    />
                    <div>
                      <label htmlFor="format">Format:</label>
                      <select
                        className="w-16 group-hover:bg-gray-700 bg-gray-800"
                        name="format"
                        id="format"
                        value={image.aiSuggestions?.format || ""}
                        onChange={(e) => {
                          const format = e.target.value;
                          setImages((prev: ImageData[]) =>
                            prev.map((img, idx) => {
                              if (idx === index && img.aiSuggestions) {
                                return {
                                  ...img,
                                  aiSuggestions: {
                                    ...img.aiSuggestions,
                                    format: format,
                                  },
                                } as ImageData;
                              }
                              return img;
                            })
                          );
                        }}
                      >
                        <option value="JPG">JPG</option>
                        <option value="PNG">PNG</option>
                        <option value="webP">WEBP</option>
                      </select>
                    </div>
                  </div>

                  <div className="w-[35%] text-sm ">
                    <div className="flex justify-between">
                      <label htmlFor="altText">Alt Text:</label>
                      <input
                        className=" grow group-hover:bg-gray-700 bg-gray-800 "
                        type="text"
                        name="altText"
                        id=""
                        value={image.aiSuggestions?.altText || ""}
                        onChange={(e) => {
                          const altText = e.target.value;
                          setImages((prev: ImageData[]) =>
                            prev.map((img, idx) => {
                              if (idx === index && img.aiSuggestions) {
                                return {
                                  ...img,
                                  aiSuggestions: {
                                    ...img.aiSuggestions,
                                    altText: altText,
                                  },
                                } as ImageData;
                              }
                              return img;
                            })
                          );
                        }}
                      />
                    </div>

                    <div className="flex justify-between">
                      <label htmlFor="tags">Tags:</label>
                      <input
                        className="grow group-hover:bg-gray-700 bg-gray-800 "
                        type="text"
                        name="tags"
                        id=""
                        value={
                          image.aiSuggestions?.tags
                            ? image.aiSuggestions.tags.join(",")
                            : ""
                        }
                        onChange={(e) => {
                          const tags = e.target.value.split(",");
                          setImages((prev: ImageData[]) =>
                            prev.map((img, idx) => {
                              if (idx === index && img.aiSuggestions) {
                                return {
                                  ...img,
                                  aiSuggestions: {
                                    ...img.aiSuggestions,
                                    tags: tags,
                                  },
                                } as ImageData;
                              }
                              return img;
                            })
                          );
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeImage(index)}
                    className="text-red-600 ml-auto w-16 mr-2 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-java-600 text-white px-4 py-2 rounded-md"
            >
              Upload Images (Max 20)
            </button>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={handleCancelClick}
              className="bg-gray-300 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              disabled={images.length === 0 || optimized}
              onClick={handleOptimizeImages}
              className="bg-java-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Optimize images
            </button>
            <button
              onClick={saveImages}
              className="bg-java-600 text-white px-4 py-2 rounded-md  disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!optimized || images.length === 0 || !albumName}
            >
              Save Album
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
