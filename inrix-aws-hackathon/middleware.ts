import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the authentication token exists in cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  console.log("Middleware");
  // check expiration of token
  if (accessToken) {
    console.log("Request contained accessToken, user is authenticated.");
  }
  // If no authToken, redirect to the login page
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // Allow request to proceed
  return NextResponse.next();
}

// Match routes where this middleware should apply
export const config = {
  matcher: ["/((?!api|login|createAccount|_next|favicon.ico).*)*"], // Apply middleware only to the homepage or add other protected routes
};
