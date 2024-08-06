"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import {
  lastOptimization,
  optimizationQuantity,
  setResetOptimization,
} from "@/src/actions/addDateAndTimesAI";
import { auth } from "@/lib/auth";
import { selecUserInfo } from "@/src/actions/selectUserInfo";
import { User } from "@/app/types/user";
import { kv } from "@vercel/kv";
import sharp from "sharp";

const DAILY_OPTIMIZATION_LIMIT = 200;
const HOURS_UNTIL_RESET = 24;
const CHUNK_EXPIRY_TIME = 600; // 10 minutes in seconds
const BATCH_SIZE = 10; // Number of chunks to retrieve in each batch

const sizeSchema = z
  .object({
    width: z.number(),
    height: z.number(),
  })
  .transform((val: unknown) => {
    if (typeof val === "string") {
      const cleanStr = val.replace(/\s/g, "");
      const jsonStr = cleanStr.replace(/"(\w+)":/g, "$1:");
      const parsed = JSON.parse(`{${jsonStr}}`);
      return { width: parsed.width, height: parsed.height };
    }
    return val;
  });

const optimizationSchema = z.object({
  altText: z.string(),
  tags: z.array(z.string()),
  size: sizeSchema,
  format: z.string(),
  quality: z.number(),
  rotation: z.number(),
  compressionLevel: z.number(),
  grayscale: z.boolean(),
});

type OptimizationSchemaType = z.infer<typeof optimizationSchema>;

const checkOptimizationLimit = (
  userInfo: User,
  imagesLength: number
): boolean => {
  return (
    userInfo.totalOptimizations !== null &&
    userInfo.totalOptimizations !== undefined &&
    userInfo.totalOptimizations + imagesLength >= DAILY_OPTIMIZATION_LIMIT
  );
};

const checkResetTime = async (
  userInfo: User,
  userId: string
): Promise<boolean> => {
  if (userInfo.lastOptimizationReset) {
    const lastOptimizationReset = userInfo.lastOptimizationReset
      ? new Date(userInfo.lastOptimizationReset)
      : new Date(0);
    const now = new Date();
    const diffHours =
      (now.getTime() - lastOptimizationReset.getTime()) / (1000 * 60 * 60);

    if (diffHours >= HOURS_UNTIL_RESET) {
      await setResetOptimization(userId);
      console.log("Reset optimization", "Hours since last reset:", diffHours);
      return true;
    }
    return false;
  }
  return true;
};

export async function sendChunk(
  chunk: string,
  index: number,
  total: number,
  prompt: string,
  userId: string
) {
  const key = `image:${userId}:${prompt}`;
  try {
    await kv.hset(key, { [`chunk:${index}`]: chunk });
    await kv.hincrby(key, "savedChunks", 1);

    if (index === total - 1) {
      await kv.hset(key, { total: total.toString() });
      await kv.expire(key, CHUNK_EXPIRY_TIME);
    }

    console.log(`Chunk ${index + 1}/${total} saved successfully`);
    return {
      success: true,
      message: `Chunk ${index + 1}/${total} saved successfully`,
    };
  } catch (error) {
    console.error(`Error saving chunk ${index + 1}/${total}:`, error);
    return {
      success: false,
      message: `Failed to save chunk ${index + 1}/${total}`,
    };
  }
}

async function processImage(base64Image: string, prompt: string) {
  console.log("Reassembled base64 image length:", base64Image.length);
  console.log("First few characters of base64Image:", base64Image.slice(0, 20));
  console.log("Last few characters of base64Image:", base64Image.slice(-20));

  let imageBuffer;

  try {
    if (base64Image.includes("data:image/")) {
      const base64Data = base64Image.split(",")[1];
      imageBuffer = Buffer.from(base64Data, "base64");
    } else {
      imageBuffer = Buffer.from(base64Image, "base64");
    }

    console.log("Image buffer length:", imageBuffer.length);

    if (imageBuffer.length === 0) {
      throw new Error("Image buffer is empty after conversion from base64");
    }

    // Check the image size using the buffer length
    const imageSizeInBytes = imageBuffer.length;
    const imageSizeInMB = imageSizeInBytes / (1024 * 1024);

    if (imageSizeInMB > 20) {
      throw new Error("Image size exceeds the 20 MB limit");
    }

    let finalBuffer;

    try {
      // Detect the image format using sharp
      const metadata = await sharp(imageBuffer).metadata();
      console.log("Image metadata:", metadata);
      const format = metadata.format;

      if (
        format === "jpeg" ||
        format === "png" ||
        format === "webp" ||
        format === "tiff"
      ) {
        // Convert supported formats to JPEG
        finalBuffer = await sharp(imageBuffer).toFormat("jpeg").toBuffer();
      } else if (format === "gif") {
        // Convert GIF to JPEG
        finalBuffer = await sharp(imageBuffer).toFormat("jpeg").toBuffer();
      } else {
        throw new Error("Unsupported image format");
      }

      console.log("Final buffer length:", finalBuffer.length);
    } catch (error) {
      console.error("Error processing image with Sharp:", error);
      throw new Error(
        "Failed to process the image. Please make sure it is a valid image file."
      );
    }

    // Convert the final buffer to base64
    const base64JpegImage = finalBuffer.toString("base64");

    const base64ImageWithPrefix = `data:image/jpeg;base64,${base64JpegImage}`;

    const { object: suggestion } = await generateObject<OptimizationSchemaType>(
      {
        model: openai("gpt-4o"),
        maxTokens: 1500,
        schema: optimizationSchema,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image", image: base64ImageWithPrefix },
            ],
          },
        ],
      }
    );

    return suggestion;
  } catch (error) {
    console.error("Error in processImage:", error);
    throw error;
  }
}

async function getChunksInBatches(
  key: string,
  totalChunks: number
): Promise<string[]> {
  const chunks: string[] = [];
  for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
    const batchKeys = Array.from(
      { length: Math.min(BATCH_SIZE, totalChunks - i) },
      (_, index) => `chunk:${i + index}`
    );
    const batchData = await kv.hmget(key, ...batchKeys);

    if (batchData) {
      Object.values(batchData).forEach((chunk) => {
        if (typeof chunk === "string") {
          chunks.push(chunk);
        }
      });
    } else {
      console.error(`Failed to retrieve batch starting at index ${i}`);
    }
  }
  return chunks;
}
export async function optimizeImage(prompt: string, userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const userInfoArray: User[] = await selecUserInfo(userId);
    if (!userInfoArray || userInfoArray.length === 0) {
      throw new Error("User information could not be retrieved");
    }
    const userInfo = userInfoArray[0];

    const shouldReset = await checkResetTime(userInfo, userId);
    if (shouldReset) {
      userInfo.totalOptimizations = 0;
    }

    if (checkOptimizationLimit(userInfo, 1)) {
      throw new Error("You have reached the limit of optimizations");
    }

    const key = `image:${userId}:${prompt}`;
    const metadata = await kv.hmget(key, "total", "savedChunks");

    if (!metadata || !metadata[0] || !metadata[1]) {
      throw new Error("Image metadata not found or incomplete");
    }

    const totalExpectedChunks = parseInt(metadata[0] as string, 10);
    const savedChunks = parseInt(metadata[1] as string, 10);

    if (isNaN(totalExpectedChunks) || isNaN(savedChunks)) {
      throw new Error("Invalid metadata: total or savedChunks is not a number");
    }

    console.log(
      `Total expected chunks: ${totalExpectedChunks}, Saved chunks: ${savedChunks}`
    );

    if (savedChunks !== totalExpectedChunks) {
      throw new Error(
        `Incomplete image data. Expected ${totalExpectedChunks} chunks, but found ${savedChunks}`
      );
    }

    const chunks = await getChunksInBatches(key, totalExpectedChunks);

    if (chunks.length !== totalExpectedChunks) {
      throw new Error(
        `Mismatch in chunk count. Expected ${totalExpectedChunks}, but retrieved ${chunks.length}`
      );
    }

    console.log("Number of chunks retrieved:", chunks.length);

    const base64Image = chunks.join("");
    console.log("Reassembled base64 length:", base64Image.length);

    const suggestion = await processImage(base64Image, prompt);

    await Promise.all([
      optimizationQuantity(userId, 1),
      lastOptimization(userId),
      shouldReset ? setResetOptimization(userId) : Promise.resolve(),
      kv.del(key),
    ]);

    return suggestion;
  } catch (error) {
    console.error("Error in optimizeImage:", error);
    throw error;
  }
}
// export async function optimizeImage(images: string[], prompt: string) {
//   if (!Array.isArray(images) || images.length === 0) {
//     throw new Error("Images array is invalid");
//   }
//   try {
//     const session = await auth();
//     if (!session?.user?.id) {
//       throw new Error("Unauthorized");
//     }

//     const imagesLength = images.length;

//     const userInfoArray: User[] = await selecUserInfo(session.user.id);
//     if (!userInfoArray || userInfoArray.length === 0) {
//       throw new Error("User information could not be retrieved");
//     }
//     const userInfo = userInfoArray[0];

//     const shouldReset = await checkResetTime(userInfo, session.user.id);
//     if (shouldReset) {
//       userInfo.totalOptimizations = 0;
//     }

//     if (checkOptimizationLimit(userInfo, imagesLength)) {
//       throw new Error("You have reached the limit of optimizations");
//     }

//     const suggestions = await Promise.all(
//       images.map(async (imageData: string) => {
//         const base64Image = imageData.startsWith("data:image")
//           ? imageData.split(",")[1]
//           : imageData;

//         try {
//           const { object: suggestion } =
//             await generateObject<OptimizationSchemaType>({
//               model: openai("gpt-4o"),
//               maxTokens: 1500,
//               schema: optimizationSchema,
//               messages: [
//                 {
//                   role: "user",
//                   content: [
//                     { type: "text", text: prompt },
//                     { type: "image", image: base64Image },
//                   ],
//                 },
//               ],
//             });

//           return suggestion;
//         } catch (generateError) {
//           console.error("Error generating suggestions:", generateError);
//           throw new Error("Failed to generate image suggestions");
//         }
//       })
//     );

//     await Promise.all([
//       optimizationQuantity(session.user.id, suggestions.length),
//       lastOptimization(session.user.id),
//       shouldReset ? setResetOptimization(session.user.id) : Promise.resolve(),
//     ]);

//     return suggestions;
//   } catch (error) {
//     console.error("Error in optimizeImages:", error);
//     if (error instanceof z.ZodError) {
//       throw new Error("Invalid input data");
//     }
//     throw error;
//   }
// }
