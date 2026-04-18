import { NextRequest, NextResponse } from "next/server";

const MARTY_URL = "http://localhost:3400";

async function proxy(req: NextRequest, segs: string[]) {
  const target = `${MARTY_URL}/api/inbox${segs.length ? "/" + segs.join("/") : ""}${req.nextUrl.search}`;
  const body = ["GET", "HEAD"].includes(req.method)
    ? undefined
    : await req.text();
  const r = await fetch(target, {
    method: req.method,
    headers: { "content-type": "application/json" },
    body,
  });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") ?? "application/json",
    },
  });
}

type RouteContext = { params: Promise<{ path?: string[] }> };

export const GET = (req: NextRequest, { params }: RouteContext) =>
  params.then((p) => proxy(req, p.path ?? []));

export const POST = (req: NextRequest, { params }: RouteContext) =>
  params.then((p) => proxy(req, p.path ?? []));

export const DELETE = (req: NextRequest, { params }: RouteContext) =>
  params.then((p) => proxy(req, p.path ?? []));
