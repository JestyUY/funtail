import { NextRequest, NextResponse } from "next/server";

const MAX_PAYLOAD_SIZE_MB = 40; // 40 MB
const MAX_PAYLOAD_SIZE_BYTES = MAX_PAYLOAD_SIZE_MB * 1024 * 1024; // Convert MB to bytes

export function middleware(request: NextRequest) {
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader
    ? parseInt(contentLengthHeader, 10)
    : 0;

  if (contentLength > MAX_PAYLOAD_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Payload Too Large :)" },
      { status: 413 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*", // Apply middleware to API routes
};
