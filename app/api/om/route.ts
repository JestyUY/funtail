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

const DAILY_OPTIMIZATION_LIMIT = 200;
const HOURS_UNTIL_RESET = 24;

const sizeSchema = z
  .object({
    width: z.any(),
    height: z.any(),
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
    const lastOptimizationReset = new Date(userInfo.lastOptimizationReset);
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

export async function POST(req: Request) {
  try {
    const { images, prompt } = await req.json();
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const [userInfo]: User[] = await selecUserInfo(session.user.id);
    const imagesLength = images.length;

    const shouldReset = await checkResetTime(userInfo, session.user.id);
    if (shouldReset) {
      userInfo.totalOptimizations = 0;
    }

    if (checkOptimizationLimit(userInfo, imagesLength)) {
      return new Response("You have reached the limit of optimizations", {
        status: 403,
      });
    }

    const suggestions = await Promise.all(
      images.map(async (imageData: string) => {
        const base64Image = imageData.startsWith("data:image")
          ? imageData.split(",")[1]
          : imageData;

        const { object: suggestion } =
          await generateObject<OptimizationSchemaType>({
            model: openai("gpt-4o"),
            maxTokens: 1500,
            schema: optimizationSchema,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image", image: base64Image },
                ],
              },
            ],
          });

        return suggestion;
      })
    );

    await Promise.all([
      optimizationQuantity(session.user.id, suggestions.length),
      lastOptimization(session.user.id),
      shouldReset ? setResetOptimization(session.user.id) : Promise.resolve(),
    ]);

    return new Response(JSON.stringify(suggestions), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST request:", error);
    if (error instanceof z.ZodError) {
      return new Response("Invalid input data", { status: 400 });
    }
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
