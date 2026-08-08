import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/layout/navbar";
import Button from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {

    const session = await getServerSession(authOptions);

    return (

        <>
            <Navbar />
            <main className="mx-auto max-w-7xl px-6 py-12"> <h1 className="text-4xl font-bold mb-4">
                Welcome {session?.user?.name} </h1>
                <p className="text-slate-400 mb-8">
                    Role: {(session?.user as any)?.role}
                </p>
                <div className="flex gap-4">
                    <Link href="/jobs">
                        <Button>Browse Jobs</Button>
                    </Link> <Link href="/profile">
                        <Button variant="outline">
                            Profile</Button>
                    </Link>
                </div>
            </main>
        </>
    );
}