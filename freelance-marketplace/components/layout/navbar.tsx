"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Button from "@/components/ui/button";

export default function Navbar() {
    const { data: session } = useSession();
    return (
        <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Link href="/" className="text-xl font-bold text-white"> FreelanceChain
                </Link>
                <nav className="flex items-center gap-4">
                    <Link href="/jobs" className="text-slate-300 hover:text-white">
                        Find Jobs
                    </Link>
                    <Link href="/freelancers" className="text-slate-300 hover:text-white" > Freelancers
                    </Link>
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
        </header>);
}