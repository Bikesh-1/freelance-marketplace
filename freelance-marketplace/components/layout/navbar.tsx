import Link from "next/link"
import Button from "@/components/ui/button"

export default function Navbar() {
    return (
        <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Link href="/" className="text-xl font-bold text-white">
                    FreelanceChain
                </Link>
                <nav className="flex items-center gap-4">
                    <Link href="/jobs" className="text-slate-300 hover:text-white">
                        Jobs
                    </Link>
                    <Link href="/freelancers" className="text-slate-300 hover:text-white"> Freelancers
                    </Link>
                    <Button variant="outline">Login</Button> <Button>Get Started</Button>
                </nav>
            </div>
        </header>
    )
}
