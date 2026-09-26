import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createWatchSchema } from "@pricewatch/schemas";
import { auth } from "@/lib/auth";
import { createWatchForUser, getWatchesForUser, isUniqueViolation } from "@/lib/watches";

async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getWatchesForUser(userId));
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = createWatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid input",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  try {
    const watch = await createWatchForUser(userId, parsed.data);
    return NextResponse.json(watch, { status: 201 });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { error: "You're already watching this URL" },
        { status: 409 }
      );
    }
    throw err;
  }
}