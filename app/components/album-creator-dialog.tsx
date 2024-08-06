"use client";

import { useState, useRef, useEffect } from "react";
import Dialog from "./dialog-modal";
import { optimizeImage, sendChunk } from "../../src/actions/optimizeImages"; // Adjust this import path as needed
import { checkAlbumQuantity } from "@/src/db/checkAlbumsQuantity";

interface UserCustomization {}
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
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOptimizeImages = async () => {
    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  const saveImages = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
        return updatedImages.slice(0, 20);
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
        className="border-2 rounded-md flex flex-col items-center justify-center bg-java-700 border-java-800 hover:cursor-pointer hover:bg-java-600 transition-colors duration-200 p-4  w-[300px] h-[300px]"
      >
        <span className="text-2xl text-java-200 mb-2">New Album</span>
        <span className="text-[120px] sm:text-[150px] text-java-200">+</span>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="New Album"
      >
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              className={`border p-2 rounded-md w-full ${
                error ? "border-red-500" : "border-java-900"
              }`}
              placeholder="Album Name"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
            />
            {!albumName && (
              <span className="text-red-500 text-sm">Required*</span>
            )}
            {error && <span className="text-red-500 text-sm">{error}</span>}
          </div>
          <div className="p-4 border border-dashed border-java-300 rounded-md min-h-36">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />

            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-java-200">No images selected</span>
                <button
                  className="px-4 py-2 bg-java-900 text-white rounded-md hover:bg-java-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Add Images
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center space-y-2 bg-java-800 p-4 rounded-md"
                    >
                      <img
                        src={image.preview}
                        alt={`Preview ${index}`}
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <div className="flex flex-col items-start w-full">
                        <span className="text-sm text-java-200">
                          {image.file.name}
                        </span>
                        {image.aiSuggestions && (
                          <span className="text-xs text-java-400">
                            {`Optimized to: ${image.aiSuggestions.size.width}x${image.aiSuggestions.size.height}, ${image.aiSuggestions.format}, ${image.aiSuggestions.quality}% quality`}
                          </span>
                        )}
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeImage(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {!optimized && (
                  <div className="flex justify-end mt-4">
                    <button
                      className="text-java-300 hover:text-java-200 hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Add More Images
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          {totalSize > 3.5 * 1024 * 1024 && (
            <p className="text-red-500 text-sm">
              Total size of images exceeds 3.5 MB. Please remove some images.
            </p>
          )}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={handleCancelClick}
              className="px-4 py-2 bg-java-900 text-white rounded-md hover:bg-java-700"
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 text-white rounded-md ${
                !albumName ||
                totalSize > 3.5 * 1024 * 1024 ||
                images.length === 0 ||
                isLoading
                  ? "bg-java-600 cursor-not-allowed"
                  : "bg-java-900 hover:bg-java-700"
              }`}
              onClick={handleOptimizeImages}
              disabled={
                !albumName ||
                totalSize > 3.5 * 1024 * 1024 ||
                images.length === 0 ||
                isLoading
              }
            >
              {isLoading ? "Optimizing..." : "Optimize"}
            </button>
            {optimized && (
              <button
                className={`px-4 py-2 text-white rounded-md ${
                  !albumName || totalSize > 3.5 * 1024 * 1024 || isLoading
                    ? "bg-java-600 cursor-not-allowed"
                    : "bg-java-900 hover:bg-java-700"
                }`}
                onClick={saveImages}
                disabled={
                  !albumName || totalSize > 3.5 * 1024 * 1024 || isLoading
                }
              >
                {isLoading ? "Saving..." : "Save Album"}
              </button>
            )}
          </div>
          {isLoading && (
            <div className="flex items-center justify-center mt-4">
              <div className="animate-spin w-8 h-8 border-4 border-t-4 border-java-500 rounded-full"></div>
              <span className="ml-4 text-java-200">
                This may take a few seconds...
              </span>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
