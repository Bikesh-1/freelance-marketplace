"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Button from "@/components/ui/button";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass =
    "rounded-full px-4 py-2 text-xs font-bold tracking-wide text-[#111] transition-colors hover:bg-red-500 hover:text-white sm:px-5";

  return (
    <header className="absolute left-0 top-0 z-50 w-full">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Freelance Marketplace home" className="shrink-0">
          <Image src="/logo.png" alt="Freelance Marketplace logo" width={44} height={44} priority />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full bg-[#EEECE7] p-1 font-bold md:flex">
          <Link href="/" className="rounded-full bg-[#0D0D0D] px-5 py-2 text-xs tracking-wide text-white transition-colors hover:bg-red-500">
            HOME
          </Link>
          <Link href="/about" className={navLinkClass}>ABOUT</Link>
          <Link href="/about" className={navLinkClass}>CONTACT</Link>
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {session ? (
            <>
              <Link href="/dashboard"><Button variant="outline">Dashboard</Button></Link>
              <Button onClick={() => signOut({ callbackUrl: "/" })}>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="outline">Login</Button></Link>
              <Link href="/register"><Button>Register</Button></Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white/80 sm:hidden"
        >
          <span className={`h-0.5 w-5 bg-black transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-5 bg-black transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-5 bg-black transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="mx-4 rounded-2xl border border-black/10 bg-[#F7F4EE] p-4 shadow-xl sm:hidden">
          <nav className="flex flex-col gap-2">
            <Link href="/" onClick={() => setMenuOpen(false)} className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white">Home</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-black hover:bg-black/5">About</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-black hover:bg-black/5">Contact</Link>
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-black hover:bg-black/5">Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-xl bg-red-500 px-4 py-3 text-left text-sm font-semibold text-white">Logout</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl border border-black/15 px-4 py-3 text-center text-sm font-semibold text-black">Login</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-xl bg-red-500 px-4 py-3 text-center text-sm font-semibold text-white">Register</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
