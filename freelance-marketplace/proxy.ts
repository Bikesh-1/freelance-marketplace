import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function proxy(request: NextRequestWithAuth) {
        const token = request.nextauth.token;
        const pathname = request.nextUrl.pathname;

        const role = token?.role as string | undefined;

        if (pathname.startsWith("/client")) {
            if (role !== "CLIENT") {
                return NextResponse.redirect(
                    new URL("/login", request.url)
                );
            }
        }
        if (pathname.startsWith("/freelancer")) {
            if (role !== "FREELANCER") {
                return NextResponse.redirect(
                    new URL("/login", request.url)
                );
            }
        }
        if (pathname.startsWith("/admin")) {
            if (role !== "ADMIN") {
                return NextResponse.redirect(
                    new URL("/login", request.url)
                );
            }
        }

        return NextResponse.next();
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
        "/admin/:path*",
        "/jobs/create/:path*",
        "/messages/:path*",
        "/profile/:path*",
        "/notifications/:path*",
        "/wallet/:path*",
    ],
};