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

export interface Album {
  createdAt: Date;
  id: string;
  name: string;
  updatedAt: Date;
  userId: string;
}
