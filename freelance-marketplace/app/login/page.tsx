"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { getDashboardRoute } from "@/lib/routes";
import Navbar from "@/components/layout/navbar";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                alert("Invalid credentials");
                return;
            }

            const session = await fetch("/api/auth/session").then((r) =>
                r.json()
            );

            const role = session?.user?.role;

            if (!role) {
                router.push("/login");
                return;
            }

            router.push(getDashboardRoute(role));
        } catch (error) {
            console.error("Login error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#F7F4EE]">
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
                            Work.
                            <br />
                            Connect.
                            <br />
                            <span className="text-gray-400">
                                Get Paid.
                            </span>
                        </h1>

                        <p className="mt-6 text-gray-400 text-base leading-relaxed max-w-md">
                            A modern freelance marketplace where clients
                            and freelancers can collaborate, manage
                            projects, and handle secure payments.
                        </p>
                    </div>

                    <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                </div>
                <div className="w-full md:w-1/2 min-h-screen bg-[#F7F4EE] flex items-center justify-center px-6 pt-24">
                    
                    <Card className="w-full max-w-md text-black border-gray-800">
                        
                        <h1 className="text-4xl font-bold mb-2 font-oswald">
                            Welcome back
                        </h1>

                        <p className="text-sm mb-6">
                            Sign in to continue managing projects,
                            proposals, and payments.
                        </p>

                        <form
                            onSubmit={handleLogin}
                            className="space-y-4"
                        >
                            {/* Email */}
                            <div>
                                <label className="block text-sm  mb-2">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    className="w-full border border-gray-700 rounded-md bg-[#0B0B0F] text-white px-4 py-3 outline-none focus:border-white transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm  mb-2">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="w-full border border-gray-700 rounded-md bg-[#0B0B0F] text-white px-4 py-3 outline-none focus:border-white transition"
                                    required
                                />
                            </div>

                            {/* Forgot Password */}
                            <div className="text-right">
                                <a
                                    href="/forgot-password"
                                    className="text-sm  hover:text-red transition"
                                >
                                    Forgot password?
                                </a>
                            </div>

                            {/* Login */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading
                                    ? "Signing in..."
                                    : "Login"}
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
                        <p className="text-center text-sm text-gray-400">
                            Don't have an account?{" "}
                            <a
                                href="/register"
                                className="text-white hover:underline"
                            >
                                Create one
                            </a>
                        </p>
                        <p className="text-center text-xs text-gray-500 mt-6 leading-relaxed">
                            By continuing, you agree to Freelanzo's
                            Terms of Service and Privacy Policy.
                        </p>
                    </Card>
                </div>
            </div>
        </main>
    );
}