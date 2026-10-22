"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import HeroSection from "@/components/GSAP/HeroSection";
import InfinityCard from "@/components/GSAP/InfintyCard";
import HomeSections from "@/components/GSAP/HomeSections";
import { getDashboardRoute } from "@/lib/routes";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const role = session?.user?.role;
    if (role) router.replace(getDashboardRoute(role));
  }, [status, session?.user?.role, router]);

  if (status === "loading" || (status === "authenticated" && session?.user?.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F4EE] text-black">
        <p className="text-sm font-medium">Taking you to your dashboard...</p>
      </main>
    );
  }

  return (
    <div id="top" className="relative min-h-screen w-full overflow-x-clip bg-[#F7F4EE] text-[#111]">
      <Navbar />
      <main className="w-full bg-[#F7F4EE] text-black">
        <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-2 pt-28 text-center sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <h1 className="font-oswald text-sm font-bold uppercase tracking-wide sm:text-base md:text-lg">
            Freelance Marketplace
          </h1>
          <p className="mt-2 font-oswald text-xs font-bold uppercase text-gray-400 sm:text-sm">
            Based on
          </p>
          <div className="my-2 w-full min-w-0 sm:my-3">
            <HeroSection />
          </div>
          <h2 className="mt-1 mb-0 font-oswald text-xs font-bold uppercase tracking-wide sm:text-sm">
            Work Submitted by Freelancer
          </h2>
        </section>
        <section aria-label="Freelancer portfolio carousel" className="relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden">
          <InfinityCard />
        </section>
        <HomeSections />
      </main>
    </div>
  );
}
