import Navbar from "@/components/layout/navbar"
import Button from "@/components/ui/button"
import Card from "@/components/ui/card"
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white"> <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="mb-6 text-6xl font-extrabold tracking-tight"> AI + Blockchain
          <span className="block text-violet-500">
            Freelance Marketplace
          </span>
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-slate-400"> Hire freelancers with AI-powered recommendations and secure blockchain escrow payments.
        </p>
        <div className="flex gap-4">
          <Button>Hire Talent</Button>
          <Button variant="outline">
            Become a Freelancer
          </Button>
        </div>
      </section>
        <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 md:grid-cols-3">
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
        </section>
      </main>
    </>
  )
}