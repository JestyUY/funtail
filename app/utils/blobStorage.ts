// app/utils/blobStorage.ts
import { put } from '@vercel/blob';
import { db } from '../../src/db'; // Assume you have a db connection setup
import { albums, images } from '../../src/db/schema'; // Import your Drizzle schema
import { ImageData, UserCustomization } from '../types/album';

export const saveToStorage = async (albumName: string, userId: string, images: ImageData[]) => {
  // Create a new album in the database
  const [newAlbum] = await db.insert(albums).values({
    name: albumName,
    userId: userId
  }).returning();

  for (let image of images) {
    if (image.userCustomization) {
      // Upload image to Vercel Blob storage
      const { url } = await put(image.file.name, image.file, {
        access: 'public',
      });

      // Save image data to the database
     // await db.insert(images).values({
      //  albumId: newAlbum.id,
      //  optimizedUrl: url,
      //  altText: image.userCustomization.altText,
      //  tags: JSON.stringify(image.userCustomization.tags),
      //  size: image.file.size,
      //  width: image.userCustomization.size.width,
       // height: image.userCustomization.size.height,
       // format: image.userCustomization.format,
      //  quality: image.userCustomization.quality,
      //  rotation: image.userCustomization.rotation,
       // compressionLevel: image.userCustomization.compressionLevel,
       // grayscale: image.userCustomization.grayscale
    //  });
    }
  }

  return newAlbum;
};