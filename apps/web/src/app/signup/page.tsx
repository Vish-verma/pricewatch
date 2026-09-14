"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    const { error } = await authClient.signUp.email({
      email: form.get("email") as string,
      password: form.get("password") as string,
      name: form.get("email") as string, // using email as name for now
    });

    if (error) {
      setError(error.message ?? "Something went wrong");
      return;
    }
    router.push("/"); // logged in — go to dashboard
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 360, fontFamily: "sans-serif" }}>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.5rem" }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password (min 8)" required minLength={8} />
        <button type="submit">Create account</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Already have an account? <a href="/login">Log in</a></p>
    </main>
  );
}