"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Button from "@/components/ui/button";
import Image from "next/image";

export default function Navbar() {
    const { data: session } = useSession();
    return (
        <header className="w-full absolute top-0 left-0">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Image
                src="/logo.png"
                alt="logo"
                width={50}
                height={50}
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center gap-2 rounded-full bg-[#EEECE7] p-1.25 font-bold">
                        <Link
                            href="/"
                            className="rounded-full bg-[#0D0D0D] px-5 py-2 text-xs tracking-wide text-white transition-colors hover:bg-red-500"
                        >
                            HOME
                        </Link>

                        <Link
                            href="/about"
                            className="rounded-full px-5 py-2 text-xs tracking-wide text-[#111] transition-colors hover:bg-red-500 hover:text-white"
                        >
                            ABOUT
                        </Link>
                        <Link
                            href="/about"
                            className="rounded-full px-5 py-2 text-xs tracking-wide text-[#111] transition-colors hover:bg-red-500 hover:text-white"
                        >
                            CONTACT
                        </Link>
                    </div>
                </div>
                <nav className="flex items-center gap-4">
                    
                    {session ? (<> <Link href="/dashboard">
                        <Button variant="outline">
                            Dashboard
                        </Button>
                    </Link>
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