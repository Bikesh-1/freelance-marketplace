"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteJobButton({
    jobId,
}: {
    jobId: string;
}) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleComplete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to mark this job as completed?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/jobs/${jobId}/complete`,
                {
                    method: "POST",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to complete job"
                );
            }

            router.refresh();
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to complete job"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleComplete}
                disabled={loading}
                className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading
                    ? "Completing..."
                    : "Mark Job Completed"}
            </button>

            {error && (
                <p className="mt-2 text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}