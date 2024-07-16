export interface ImageData {
  file: File;
  preview: string;
  aiSuggestions?: AISuggestions;
  userCustomization?: UserCustomization;
}

export interface AISuggestions {
  altText: string;
  tags: string[];
  size: { width: number; height: number };
  format: string;
  quality: number;
  rotation: number;
  compressionLevel: number;
  grayscale: boolean;
}

export interface UserCustomization {
  altText: string;
  tags: string[];
  size: { width: number; height: number };
  format: string;
  quality: number;
  rotation: number;
  compressionLevel: number;
  grayscale: boolean;
}

/*
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
*/
