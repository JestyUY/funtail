import { selectAlbumPublic } from "@/src/db/selectAlbumPublic";
import { rateLimits } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import z from "zod";

const EXPORT_ALBUM_ID_SCHEMA = z.string().uuid();

const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 20,
  WINDOW_SECONDS: 60,
};

const UNKNOWN_IP = "unknown";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secretId = searchParams.get("secretId");

  if (!secretId) {
    return new Response("exportAlbumId is required", { status: 400 });
  }

  try {
    const ip = getIpAddress(req);
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000
    );

    const rateLimit = await getRateLimit(ip, windowStart);

    if (rateLimit.exceeded) {
      return new Response("Rate limit exceeded. Try again later.", {
        status: 429,
      });
    }

    EXPORT_ALBUM_ID_SCHEMA.parse(secretId);
    const albumImages = await selectAlbumPublic(secretId);

    if (!albumImages || albumImages.length === 0) {
      return new Response("Album not found", { status: 404 });
    }

    return new Response(JSON.stringify(albumImages), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation Error:", error.errors);
      return new Response("Invalid exportAlbumId format", { status: 400 });
    }

    console.error("Error fetching album:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function getRateLimit(ip: string, windowStart: Date) {
  const existingRateLimit = await db
    .select()
    .from(rateLimits)
    .where(eq(rateLimits.ip, ip))
    .limit(1);

  if (
    !existingRateLimit.length ||
    existingRateLimit[0].lastReset < windowStart
  ) {
    await db
      .insert(rateLimits)
      .values({ ip, count: 1, lastReset: new Date() })
      .onConflictDoUpdate({
        target: rateLimits.ip,
        set: { count: 1, lastReset: new Date() },
      });

    return { exceeded: false };
  }

  const newCount = existingRateLimit[0].count + 1;
  if (newCount > RATE_LIMIT_CONFIG.MAX_REQUESTS) {
    return { exceeded: true };
  }

  await db
    .update(rateLimits)
    .set({ count: newCount })
    .where(eq(rateLimits.ip, ip));

  return { exceeded: false };
}

function getIpAddress(req: Request) {
  return (
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    (req as any).socket.remoteAddress ||
    UNKNOWN_IP
  );
}
