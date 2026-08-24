import Navbar from "@/components/layout/navbar"
import HersoSection from "@/components/GSAP/HeroSection";
import InfinityCard from "@/components/GSAP/InfintyCard";
export default function Home() {
  return (
    <>
      <div className="min-h-screen w-full bg-white relative text-gray-800 overflow-x-hidden">

        <Navbar />
        <main className="min-h-screen bg-[#F7F4EE] text-black uppercase flex items-center justify-center">
          <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
            <h1 className="font-oswald text-md -rotate-3 font-bold">
              Freelance Marketplace
            </h1>
            <h1 className="font-oswald font-bold text-sm text-gray-400">Based on</h1>
            <div className="p-4">
                <HersoSection/>
            </div>
            
            <h1 className="font-bold font-oswald text-xs">
  Work Submitted by Freelancer
</h1>
            <p className="m-10">
                <InfinityCard/>
            </p>
            
          </section>
        </main>
      </div>


    </>
  )
}