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
  createdAt: Date | null;
  id: string;
  name: string;
  updatedAt: Date | null;
  userId: string;
  pictures?: mergedImage[];
  exportId: string;
}

export interface mergedImage {
  albumId: string;
  altText: string | null;
  compressionLevel: number | null;
  format: string | null;
  grayscale: boolean | null;
  height: number | null;
  id: string;
  optimizedUrl: string;
  quality: number | null;
  rotation: number | null;
  size: number | null;
  tags: string | null;
  updatedAt: Date | null;
  width: number | null;
}

export interface exportedImages {
  optimizedUrl: string;
  altText: string;
  tags: string;
  size: number;
  width: number;
  height: number;
}
