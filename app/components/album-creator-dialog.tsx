"use client";

import { useState, useRef, useEffect } from "react";
import Dialog from "./dialog-modal";
import { ImageData, UserCustomization, AISuggestions } from "../types/album";
import { sessions } from "@/src/db/schema";

export default function AlbumCreatorDialog({
  userId,
  onAlbumCreated,
}: {
  userId: string;
  onAlbumCreated: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [albumName, setAlbumName] = useState(""); // Add state for album name
  const [images, setImages] = useState<ImageData[]>([]);
  const [optimized, setOptimized] = useState(false);

  const optimizeImages = async () => {
    // Convert blob URLs to base64
    const imageData = await Promise.all(
      images.map(async (img) => {
        const response = await fetch(img.preview);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
    );

    const prompt = `
    Analyze this specific image in detail and provide optimized settings for web use. Consider the following aspects:
    
    1. Image Content: Describe the main subject and key elements of the image short answer Max  characters 15
    
    2. Dimensions: 
       
       -keeping the aspect ratio intact, recommend ideal dimensions width and height for web display keeping the Aspect Ratio intact
       
    
    3. Image Format:
       
       - Recommend the best format (webP,PNG or JPG) for a minimum file size and optimal visual quality
       
    
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
       - Provide a relevant and descriptive alt text (max  characters) for accessibility purposes 
       - Explain key elements that should be conveyed in the alt text
    
    8. Categorization:
       - Suggest up to 5 relevant tags based on the image content
       - Explain why each tag is relevant
    
    9. Special Considerations:
       - Any unique characteristics of this image that affect optimization?
       - Are there any areas of the image that require special attention for web display?
    
    Prioritize web performance while maintaining good visual quality. Provide a brief explanation for each of your recommendations, focusing on how they relate to this specific image.
    `;
    // const prompt = `
    //   Analyze this image and suggest optimal settings for web use, considering:
    //   1. Ideal dimensions for web display (max width 1920px, max height 1080px)
    //   2. Best image format (JPEG, PNG, or WebP), whatever is most efficient
    //   3. Optimal quality setting (0-100) balancing file size and visual quality
    //   4. Compression level (1-9) if applicable
    //   5. Whether grayscale would be beneficial
    //   6. Any rotation needed (in degrees)
    //   7. Relevant alt text for accessibility (max 125 characters)
    //   8. Up to 5 relevant tags for categorization

    //   Prioritize web performance while maintaining good visual quality.
    // `;

    try {
      const response = await fetch("/api/om", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imageData, prompt }),
      });

      if (!response.ok)
        throw new Error("Failed to get optimization suggestions");

      if (response.ok) setOptimized(true);

      const suggestions = await response.json();
      setImages((prevImages) =>
        prevImages.map((img, index) => ({
          ...img,
          aiSuggestions: suggestions[index],
        }))
      );
      console.log(suggestions);
    } catch (error) {
      console.error("Error optimizing images:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const saveImages = async () => {
    const albumId = crypto.randomUUID(); // Generate one albumId for all images

    const imagesToSave = await Promise.all(
      images.map(async (img) => {
        const response = await fetch(img.preview);
        const blob = await response.blob();
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
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
      // Update your state or perform any other actions with the saved image data
    } catch (error) {
      console.error("Error saving images:", error);
      // Handle error (e.g., show error message to user)
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
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
          <input
            type="text"
            className="border border-indigo-900 p-2 rounded-md w-[300px]"
            placeholder="Album Name"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)} // Update albumName state on input change
          />
          <div className="p-2 border border-dashed border-indigo-300 rounded-md">
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
                  className="flex items-center hover:bg-gray-100 w-full group "
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
                        className="w-16 group-hover:bg-gray-50 "
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
                    <div className="w-32  flex justify-between">
                      <label htmlFor="height">height:</label>
                      <input
                        className="w-16 group-hover:bg-gray-50"
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
                                } as ImageData; // Explicitly cast to ImageData
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
              className="bg-indigo-600 text-white px-4 py-2 rounded-md"
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
              onClick={optimizeImages}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Optimize images
            </button>
            <button
              onClick={saveImages}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md  disabled:opacity-50 disabled:cursor-not-allowed"
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
