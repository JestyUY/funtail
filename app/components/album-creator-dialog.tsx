"use client";

import { useState, useRef, useEffect } from "react";
import Dialog from "./dialog-modal";
import { optimizeImage, sendChunk } from "../../src/actions/optimizeImages"; // Adjust this import path as needed
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
  const [totalSize, setTotalSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOptimizeImages = async () => {
    try {
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

      // Send all images to the API in a single request
      const response = await fetch("/api/om", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: imageData,
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const suggestions = await response.json();

      // Update state with optimized images
      const imageSuggestions = images.map((image, index) => ({
        ...image,
        aiSuggestions: suggestions[index],
      }));

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
            setError(`An error occurred: ${error.message}`);
        }
      } else {
        setError("An unexpected error occurred.");
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

  useEffect(() => {
    const total = images.reduce((acc, image) => acc + image.file.size, 0);
    setTotalSize(total);
  }, [images]);

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
                  <div className="flex items-center w-full justify-between hover:bg-gray-800 border-[1px] p-2 rounded-lg border-gray-500">
                    <img
                      src={image.preview}
                      alt={`Preview ${index}`}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex flex-col items-start flex-grow ml-4">
                      <span className="text-sm">{image.file.name}</span>
                      {image.aiSuggestions && (
                        <span className="text-xs text-gray-400">
                          {`Optimized to: ${image.aiSuggestions.size.width}x${image.aiSuggestions.size.height}, ${image.aiSuggestions.format} , ${image.aiSuggestions.quality}% quality `}
                        </span>
                      )}
                    </div>
                    <button
                      className="ml-4 text-red-500 hover:text-red-700"
                      onClick={() => removeImage(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                className={`mt-2 text-java-300 hover:text-java-200 hover:underline ${
                  optimized ? "hidden" : ""
                } `}
                onClick={() => fileInputRef.current?.click()}
              >
                Add Images
              </button>
            </div>
          </div>
          {totalSize > 4 * 1024 * 1024 && (
            <p className="text-red-500">
              Total size of images exceeds 3 MB. Please remove some images.
            </p>
          )}
          <div className="flex justify-end mt-4">
            {!optimized ? (
              <div className="flex gap-3">
                <button
                  onClick={handleCancelClick}
                  className="px-4 py-2 bg-java-900 text-white rounded-md hover:bg-java-700"
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 bg-java-900 text-white rounded-md hover:bg-java-700 ${
                    !albumName || totalSize > 3 * 1024 * 1024
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={handleOptimizeImages}
                  disabled={!albumName || totalSize > 3 * 1024 * 1024}
                >
                  Optimize
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  className={`px-4 py-2 bg-java-900 text-white rounded-md hover:bg-java-700 ${
                    !albumName || totalSize > 3 * 1024 * 1024
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={saveImages}
                  disabled={!albumName || totalSize > 3 * 1024 * 1024}
                >
                  Save Album
                </button>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
