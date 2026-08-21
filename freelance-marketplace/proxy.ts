import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(
  function proxy(request: NextRequest) {
    return;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/client/:path*",
    "/freelancer/:path*",
    "/jobs/create/:path*",
    "/messages/:path*",
    "/profile/:path*",
  ],
};