"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("FREELANCER");
    const [loading, setLoading] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role,
            }),
        });

        setLoading(false);

        if (res.ok) {
            router.push("/login");
        } else {
            const data = await res.json();
            alert(data.error);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-6 bg-[#0B0B0F]">
            <span className="absolute top-0 left-0 p-4 text-xl flex items-center justify-center gap-2 text-white font-mono">
                <h1 className="font-bold text-red-500">&lt;/&gt;</h1>
                <span>freelanzo</span>
            </span>

            <Card className="w-full max-w-md bg-[#0B0B0F]">
                <h1 className="text-3xl font-bold mb-2">Create your account</h1>
                <p className="text-sm text-gray-400 mb-6">
                    Join Freelanzo and start hiring top talent or offering your skills to clients worldwide.
                </p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded-md bg-[#0B0B0F] px-2 py-2 outline-none"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border rounded-md bg-[#0B0B0F] px-2 py-2 outline-none"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded-md bg-[#0B0B0F] px-2 py-2 outline-none"
                    />

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full border rounded-md bg-[#0B0B0F] px-2 py-2 outline-none"
                    >
                        <option value="FREELANCER">Freelancer</option>
                        <option value="CLIENT">Client</option>
                    </select>

                    <Button className="w-full" disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </Button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-800" />
                    <span className="px-3 text-xs text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-800" />
                </div>

                <p className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <a href="/login" className="text-white hover:underline">
                        Sign in
                    </a>
                </p>

                <p className="text-center text-xs text-gray-500 mt-6">
                    By creating an account, you agree to Freelanzo's Terms of Service and Privacy Policy.
                </p>
            </Card>
        </main>
    );
}