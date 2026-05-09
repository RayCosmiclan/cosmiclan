import { NextRequest, NextResponse } from "next/server";

const PRIVATE_PATHS = [
  "/agents",
  "/channels",
  "/conversations",
  "/inbox",
  "/menubar",
  "/mission",
  "/settings",
  "/api/channel-send",
  "/api/comms",
  "/api/drafts",
  "/api/inbox",
  "/api/send",
  "/api/threads",
];

function isPrivatePath(pathname: string) {
  return PRIVATE_PATHS.some((path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

export function proxy(request: NextRequest) {
  if (!isPrivatePath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return new NextResponse("Not Found", {
    status: 404,
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const config = {
  matcher: [
    "/agents/:path*",
    "/channels/:path*",
    "/conversations/:path*",
    "/inbox/:path*",
    "/menubar/:path*",
    "/mission/:path*",
    "/settings/:path*",
    "/api/channel-send/:path*",
    "/api/comms/:path*",
    "/api/drafts/:path*",
    "/api/inbox/:path*",
    "/api/send/:path*",
    "/api/threads/:path*",
  ],
};
