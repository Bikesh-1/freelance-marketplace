"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CreateJobPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        title: "",
        description: "",
        budget: 100,
        jobType: "FIXED",
        duration: "1 Week",
        deadline: "",
        requiredSkills: [],
    });

    const [loading, setLoading] = useState(false);

    const submitHandler = async () => {
        try {
            setLoading(true);

            await axios.post("/api/jobs", {
                ...form,
                skillIds: [],
            });

            router.push("/client/dashboard");
        } catch (error) {
            console.error(error);
            alert("Failed to create job");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-6 space-y-6">
            <h1 className="text-3xl font-bold">
                Post a New Job
            </h1>

            <input
                placeholder="Job Title"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
                onChange={(e) =>
                    setForm({
                        ...form,
                        title: e.target.value,
                    })
                }
            />

            <textarea
                placeholder="Job Description"
                rows={6}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
                onChange={(e) =>
                    setForm({
                        ...form,
                        description: e.target.value,
                    })
                }
            />

            <input
                type="number"
                placeholder="Budget"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
                onChange={(e) =>
                    setForm({
                        ...form,
                        budget: Number(e.target.value),
                    })
                }
            />
            <input
                type="date"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
                onChange={(e) =>
                    setForm({
                        ...form,
                        deadline: e.target.value,
                    })
                }
            />
            <select
                className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
                value={form.jobType}
                onChange={(e) =>
                    setForm({
                        ...form,
                        jobType: e.target.value,
                    })
                }
            >
                <option value="FIXED">Fixed Price</option>
                <option value="HOURLY">Hourly</option>
            </select>

            <button
                onClick={submitHandler}
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500"
            >
                {loading ? "Posting Job..." : "Post Job"}
            </button>
        </div>
    );
}