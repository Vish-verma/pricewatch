import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          borderBottom: "1px solid #ddd",
        }}
      >
        <strong>PriceWatch</strong>
        <span style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ color: "#666", fontSize: "0.9rem" }}>{session.user.email}</span>
          <SignOutButton />
        </span>
      </header>
      {children}
    </div>
  );
}