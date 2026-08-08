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
        <main className="min-h-screen flex items-center justify-center px-6">
            <Card className="w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6">
                    Create Account
                </h1>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none" />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none" />
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none" >
                        <option value="FREELANCER">Freelancer</option>
                        <option value="CLIENT">Client</option> </select>
                    <Button className="w-full" disabled={loading}> {loading ? "Creating account..." : "Register"}
                    </Button>
                </form>
            </Card>
        </main>);
}