"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { getDashboardRoute } from "@/lib/routes";

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

    if (res?.error) {
        alert("Invalid credentials");
        return;
    }

    const session = await fetch("/api/auth/session").then((r) => r.json());

    router.push(getDashboardRoute(session?.user?.role));
    
    const role = session?.user?.role;

    if (role === "CLIENT") {
        router.push("/client/dashboard");
    } else if (role === "FREELANCER") {
        router.push("/freelancer/dashboard");
    } else if (role === "ADMIN") {
        router.push("/admin");
    } else {
        router.push("/login");
    }
}

    return (
        <main className="min-h-screen flex items-center justify-center px-6 bg-[#0B0B0F]">
            <span className="absolute top-0 left-0 p-4 text-xl flex items-center justify-center gap-2 text-white font-mono">
                <h1 className="font-bold text-red-500">&lt;/&gt;</h1>
                <span>freelanzo</span>
            </span>

            <Card className="w-full max-w-md bg-[#0B0B0F]">
                <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
                <p className="text-sm text-gray-400 mb-6">
                    Sign in to continue managing projects, proposals, and payments.
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border rounded-md bg-[#0B0B0F] px-2 py-1 outline-none"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded-md bg-[#0B0B0F] px-2 py-1 outline-none"
                    />

                    <div className="text-right">
                        <a href="/forgot-password" className="text-sm text-gray-400 hover:text-white">
                            Forgot password?
                        </a>
                    </div>

                    <Button className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Login"}
                    </Button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-800" />
                    <span className="px-3 text-xs text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-800" />
                </div>

                <p className="text-center text-sm text-gray-400">
                    Don't have an account?{" "}
                    <a href="/register" className="text-white hover:underline">
                        Create one
                    </a>
                </p>

                <p className="text-center text-xs text-gray-500 mt-6">
                    By continuing, you agree to Freelanzo's Terms of Service and Privacy Policy.
                </p>
            </Card>
        </main>
    );
}