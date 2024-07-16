import { db } from "./index";
import { images } from "./schema"; // Adjust the import path as needed

export async function saveImageInfoToDatabase(imageInfo: {
  albumId: string;
  optimizedUrl: string;
  altText?: string;
  tags?: string;
  size?: number;
  width?: number;
  height?: number;
  format?: string;
  quality?: number;
  rotation?: number;
  compressionLevel?: number;
  grayscale?: boolean;
}) {
  await db.insert(images).values(imageInfo);
}
