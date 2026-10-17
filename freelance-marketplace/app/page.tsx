import Navbar from "@/components/layout/navbar";
import HeroSection from "@/components/GSAP/HeroSection";
import InfinityCard from "@/components/GSAP/InfintyCard";
import HomeSections from "@/components/GSAP/HomeSections";

export default function Home() {
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
          <div className="w-full min-w-0">
            <InfinityCard />
          </div>
        </section>
        <HomeSections />
      </main>
    </div>
  );
}
