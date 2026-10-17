"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Button from "@/components/ui/button";
import Image from "next/image";

export default function Loginnavbar() {
  const { data: session } = useSession();

  return (
    <header className="relative z-40 w-full border-b border-neutral-200/70 bg-white/95">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Freelance Marketplace home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Freelance Marketplace logo"
            width={44}
            height={44}
            priority
            className="h-9 w-9 object-contain sm:h-11 sm:w-11"
          />
        </Link>

        <nav aria-label="Account navigation" className="flex shrink-0 items-center gap-2 sm:gap-3">
          {session ? (
            <Button onClick={() => signOut({ callbackUrl: "/" })}>
              Logout
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
