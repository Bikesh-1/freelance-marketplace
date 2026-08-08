export { default } from "next-auth/middleware";

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