import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

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

export async function POST(req: Request) {
  const { images, prompt } = await req.json();

  const suggestions = await Promise.all(
    images.map(async (imageData: string) => {
      const base64Image =
        typeof imageData === "string"
          ? imageData.replace(/^data:image\/\w+;base64,/, "")
          : imageData;

      const { object: suggestion } =
        await generateObject<OptimizationSchemaType>({
          model: anthropic("claude-3-haiku-20240307"),
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

  return new Response(JSON.stringify(suggestions), {
    headers: { "Content-Type": "application/json" },
  });
}
