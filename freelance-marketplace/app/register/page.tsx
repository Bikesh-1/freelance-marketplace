"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("FREELANCER");
    const [loading, setLoading] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();

        if (!name || !email || !password) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
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

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to create account");
                return;
            }

            router.push("/login");
        } catch (error) {
            console.error("Register error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#F7F4EE] ">
            {/* Navbar */}
            <div className="absolute top-0 left-0 right-0 z-50">
                <Navbar />
            </div>

            <div className="min-h-screen flex">
                <div className="hidden md:flex w-1/2 min-h-screen bg-black text-white items-center justify-center relative overflow-hidden">
                    <div className="relative z-10 px-12 max-w-xl">
                        <p className="text-sm uppercase tracking-[0.3em] font-oswald mb-6">
                            Freelanzo
                        </p>

                        <h1 className="text-5xl lg:text-6xl font-bold leading-tight font-oswald">
                            Start.
                            <br />
                            Build.
                            <br />
                            <span className="text-gray-400">
                                Grow.
                            </span>
                        </h1>

                        <p className="mt-6 text-gray-400 text-base leading-relaxed max-w-md">
                            Join Freelanzo and connect with clients and
                            freelancers, collaborate on projects, and
                            manage secure payments in one place.
                        </p>
                    </div>

                    {/* Background Decoration */}
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                </div>

                {/* ================= RIGHT SIDE ================= */}
                <div className="w-full md:w-1/2 min-h-screen bg-[#F7F4EE] flex items-center justify-center px-6 pt-24 pb-10">
                    <Card className="w-full max-w-md text-black border-gray-800">
                        <h1 className="text-4xl font-bold mb-2 font-oswald">
                            Create your account
                        </h1>

                        <p className="text-sm mb-6">
                            Join Freelanzo and start hiring top talent or
                            offering your skills to clients worldwide.
                        </p>

                        <form
                            onSubmit={handleRegister}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm mb-2">
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full border border-gray-700 rounded-md bg-[#0B0B0F] text-white px-4 py-3 outline-none focus:border-white transition"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm mb-2">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full border border-gray-700 rounded-md bg-[#0B0B0F] text-white px-4 py-3 outline-none focus:border-white transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password + Role */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Password */}
    <div>
        <label className="block text-sm mb-2">
            Password
        </label>

        <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-700 rounded-md bg-[#0B0B0F] text-white px-4 py-3 outline-none focus:border-white transition"
            required
        />
    </div>

    {/* Role */}
    <div>
        <label className="block text-sm mb-2">
            I want to join as
        </label>

        <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-700 rounded-md bg-[#0B0B0F] text-white px-4 py-3 outline-none focus:border-white transition cursor-pointer"
        >
            <option value="FREELANCER">
                Freelancer
            </option>

            <option value="CLIENT">
                Client
            </option>
        </select>
    </div>
</div>

                            {/* Register Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-gray-800" />

                            <span className="px-3 text-xs text-gray-500">
                                OR
                            </span>

                            <div className="flex-1 border-t border-gray-800" />
                        </div>

                        {/* Login */}
                        <p className="text-center text-sm text-gray-500">
                            Already have an account?{" "}
                            <a
                                href="/login"
                                className="text-black font-medium hover:underline"
                            >
                                Sign in
                            </a>
                        </p>

                        <p className="text-center text-xs text-gray-500 mt-6 leading-relaxed">
                            By creating an account, you agree to
                            Freelanzo&apos;s Terms of Service and Privacy
                            Policy.
                        </p>
                    </Card>
                </div>
            </div>
        </main>
    );
}