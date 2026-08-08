"use client";

import { useState } from "react";
import axios from "axios";

export default function ClientProfilePage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    country: "",
  });

  const submitHandler = async () => {
    try {
      setLoading(true);

      await axios.post("/api/profile/complete", form);

      window.location.href = "/client/dashboard";
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-20">
      <h1 className="text-3xl font-bold mb-10">
        Complete Client Profile
      </h1>

      <input
        placeholder="Company Name"
        className="border p-3 w-full mb-4 rounded bg-slate-900 text-white"
        onChange={(e) =>
          setForm({
            ...form,
            companyName: e.target.value,
          })
        }
      />

      <input
        placeholder="Country"
        className="border p-3 w-full mb-6 rounded bg-slate-900 text-white"
        onChange={(e) =>
          setForm({
            ...form,
            country: e.target.value,
          })
        }
      />

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