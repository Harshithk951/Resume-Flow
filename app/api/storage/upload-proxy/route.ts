// app/api/storage/upload-proxy/route.ts
// Same-origin fallback proxy for Convex Storage uploads.
// Bypasses browser cross-origin CORS/502 blocks by proxying the request server-side.

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const targetUrl = req.nextUrl.searchParams.get("target");
    if (!targetUrl) {
      return NextResponse.json(
        { error: "Missing required query parameter: target" },
        { status: 400 }
      );
    }

    // Read input binary stream
    const contentType = req.headers.get("content-type") || "application/octet-stream";
    const bodyBuffer = await req.arrayBuffer();

    // Forward upload to target Convex storage URL
    const upstreamRes = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body: bodyBuffer,
    });

    const responseText = await upstreamRes.text();

    if (!upstreamRes.ok) {
      console.error("[StorageProxy] Upstream upload failed:", upstreamRes.status, responseText);
      return NextResponse.json(
        { error: `Upstream storage returned status ${upstreamRes.status}` },
        { status: upstreamRes.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { storageId: responseText.trim() };
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("[StorageProxy] Internal error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to proxy storage upload" },
      { status: 500 }
    );
  }
}
