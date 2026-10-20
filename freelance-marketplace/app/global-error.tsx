"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "system-ui, sans-serif", background: "#F7F4EE", color: "#111" }}>
          <section style={{ maxWidth: 480, textAlign: "center" }}>
            <p style={{ fontWeight: 700, letterSpacing: 3, color: "#ef4444" }}>FREELANZO</p>
            <h1 style={{ fontSize: 32 }}>We hit an unexpected error.</h1>
            <p style={{ lineHeight: 1.6 }}>Try the page again. If the issue continues, return later.</p>
            <button onClick={() => reset()} style={{ marginTop: 16, border: 0, borderRadius: 12, background: "#111", color: "#fff", padding: "12px 20px", cursor: "pointer" }}>Try again</button>
          </section>
        </main>
      </body>
    </html>
  );
}
