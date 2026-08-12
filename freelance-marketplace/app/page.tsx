import Navbar from "@/components/layout/navbar"
import Button from "@/components/ui/button"
import Card from "@/components/ui/card"
export default function Home() {
  return (
    <>
      <div className="min-h-screen w-full bg-white relative text-gray-800">
        <div
  className="absolute inset-0 z-0 pointer-events-none"
  style={{
    backgroundImage: `


      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 19px,
        rgba(75, 85, 99, 0.08) 19px,
        rgba(75, 85, 99, 0.08) 20px,
        transparent 20px,
        transparent 39px,
        rgba(75, 85, 99, 0.08) 39px,
        rgba(75, 85, 99, 0.08) 40px
      ),

      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 19px,
        rgba(75, 85, 99, 0.08) 19px,
        rgba(75, 85, 99, 0.08) 20px,
        transparent 20px,
        transparent 39px,
        rgba(75, 85, 99, 0.08) 39px,
        rgba(75, 85, 99, 0.08) 40px
      ),

      radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.12) 2px, transparent 2px),
      radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.12) 2px, transparent 2px)
    `,
    backgroundSize:
      '100% 100%, 100% 100%, 100% 100%, 40px 40px, 40px 40px, 40px 40px, 40px 40px',
  }}
/>
        <Navbar />
        <main className="min-h-screen bg-[#0B0B0F] text-white font-mono flex items-center justify-center"> 
          <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="mb-6 text-6xl font-extrabold tracking-tight"> Where ambitious founders 
            <span className="block text-red-500">
              meet exceptional freelancers.
            </span>
          </h1>
          <p className=" max-w-2xl text-lg text-slate-400"> Hire freelancers with AI-powered recommendations and secure blockchain escrow payments.
          </p>
          <div className="flex gap-4">
            <Button>Hire Talent</Button>
            <Button variant="outline">
              Become a Freelancer
            </Button>
          </div>
        </section>
          {/* <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 md:grid-cols-3">
          <Card>
            <h3 className="mb-2 text-xl font-semibold">AI Matching
            </h3>
            <p className="text-slate-400">
              Smart recommendation engine that matches jobs and freelancers.
            </p>
          </Card>
          <Card>
            <h3 className="mb-2 text-xl font-semibold">
              Blockchain Escrow
            </h3>
            <p className="text-slate-400">
              Funds stay locked until work is completed and approved.
            </p>
          </Card>
          <Card>
            <h3 className="mb-2 text-xl font-semibold">
              Secure Payments</h3>
            <p className="text-slate-400"> MetaMask integration with Ethereum Sepolia test network. </p>
          </Card>
        </section> */}
        </main>
      </div>


    </>
  )
}