// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // This won't bypass Vercel's limit, but it can help with Next.js internal limits
  return NextResponse.next({
    request: {
      headers: new Headers({ "x-middleware-override-body-size": "40000000" }),
    },
  });
}

export const config = {
  matcher: "/api/om/:path*",
};
