import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (
      req.nextUrl.pathname.startsWith("/dashboard/superadmin") &&
      decoded.role !== "superadmin"
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (
      req.nextUrl.pathname.startsWith("/dashboard/admin") &&
      !["admin", "superadmin"].includes(decoded.role)
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
