import { cookies } from "next/headers";
import { sql } from "./db";

export interface User {
  id: number;
  email: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return null;
  }

  try {
    const { rows } = await sql`
      SELECT id, email FROM users WHERE id = ${parseInt(userId)}
    `;

    if (rows.length === 0) {
      return null;
    }

    return {
      id: rows[0].id,
      email: rows[0].email,
    };
  } catch (error) {
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

