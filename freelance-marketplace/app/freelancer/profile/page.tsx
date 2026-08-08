"use client";

import { useState } from "react";
import axios from "axios";

export default function FreelancerProfilePage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    country: "",
    hourlyRate: 10,
    experienceLevel: "BEGINNER",
  });

  const submitHandler = async () => {
    try {
      setLoading(true);

      await axios.post("/api/profile/complete", form);

      window.location.href = "/freelancer/dashboard";
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-20">
      <h1 className="text-3xl font-bold mb-10">
        Complete Freelancer Profile
      </h1>

      <input
        placeholder="Full Name"
        className="border p-3 w-full mb-4 rounded bg-slate-900 text-white"
        onChange={(e) =>
          setForm({ ...form, fullName: e.target.value })
        }
      />

      <textarea
        placeholder="Bio"
        className="border p-3 w-full mb-4 rounded bg-slate-900 text-white"
        rows={5}
        onChange={(e) =>
          setForm({ ...form, bio: e.target.value })
        }
      />

      <input
        placeholder="Country"
        className="border p-3 w-full mb-4 rounded bg-slate-900 text-white"
        onChange={(e) =>
          setForm({ ...form, country: e.target.value })
        }
      />

      <input
        type="number"
        placeholder="Hourly Rate"
        className="border p-3 w-full mb-4 rounded bg-slate-900 text-white"
        onChange={(e) =>
          setForm({
            ...form,
            hourlyRate: Number(e.target.value),
          })
        }
      />

      <select
        className="border p-3 w-full mb-6 rounded bg-slate-900 text-white"
        value={form.experienceLevel}
        onChange={(e) =>
          setForm({
            ...form,
            experienceLevel: e.target.value,
          })
        }
      >
        <option value="BEGINNER">Beginner</option>
        <option value="INTERMEDIATE">Intermediate</option>
        <option value="ADVANCED">Advanced</option>
        <option value="EXPERT">Expert</option>
      </select>

      <button
        onClick={submitHandler}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded w-full"
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}