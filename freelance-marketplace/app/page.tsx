import Navbar from "@/components/layout/navbar";
import HeroSection from "@/components/GSAP/HeroSection";
import InfinityCard from "@/components/GSAP/InfintyCard";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-white text-gray-800">
      <Navbar />
      <main className="flex min-h-screen items-center justify-center bg-[#F7F4EE] px-4 pb-8 pt-24 text-black sm:px-6 sm:pt-28 lg:px-8">
        <section className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center py-10 text-center sm:py-14 lg:py-20">
          <h1 className="font-oswald text-sm font-bold uppercase tracking-wide sm:text-base md:text-lg">
            Freelance Marketplace
          </h1>
          <p className="mt-3 font-oswald text-xs font-bold uppercase text-gray-400 sm:text-sm">
            Based on
          </p>
          <div className="my-5 w-full min-w-0 sm:my-8">
            <HeroSection />
          </div>
          <h2 className="mb-1 font-oswald text-xs font-bold uppercase tracking-wide sm:text-sm">
            Work Submitted by Freelancer
          </h2>
          <div className="w-full min-w-0">
            <InfinityCard />
          </div>
        </section>
      </main>
    </div>
  );
}
