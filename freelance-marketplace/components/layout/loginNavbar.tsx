"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Button from "@/components/ui/button";
import Image from "next/image";

export default function Loginnavbar() {
    const { data: session } = useSession();
    return (
        <header className="w-full">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Image
                    src="/logo.png"
                    alt="logo"
                    width={50}
                    height={50}
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                </div>
                <nav className="flex items-center gap-4">

                    {session ? (<>
                        <Button onClick={() => signOut({ callbackUrl: "/" })}>
                            Logout
                        </Button> </>) : (<> <Link href="/login">
                            <Button variant="outline">Login</Button>
                        </Link> <Link href="/register">
                                <Button>Register</Button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}