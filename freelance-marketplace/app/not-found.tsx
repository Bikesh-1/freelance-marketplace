import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F4EE] px-5 py-16 text-[#111]">
      <section className="w-full max-w-xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">Freelanzo</p>
        <p className="mt-8 font-oswald text-8xl font-bold tracking-tight sm:text-9xl">404</p>
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">This page has gone off the map.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">The link may be outdated, or the page may have moved. Head back home or sign in to continue.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500">Go home</Link>
          <Link href="/login" className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold transition hover:border-black">Sign in</Link>
        </div>
      </section>
    </main>
  );
}
