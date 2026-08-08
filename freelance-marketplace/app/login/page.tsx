"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (!res?.error) {
            const session = await fetch("/api/auth/session").then((r) => r.json());

            if (session?.user?.role === "CLIENT") {
                router.push("/client/dashboard");
            } else {
                router.push("/freelancer/dashboard");
            }
        } else {
            alert("Invalid credentials");
        }
    }
    return (
        <main className="min-h-screen flex items-center justify-center px-6">
            <Card className="w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6">
                    Login
                </h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none" />

                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none" />
                    <Button className="w-full"
                        disabled={loading}> {loading ? "Signing in..." : "Login"}
                    </Button>
                </form>
            </Card>
        </main>
    );
}