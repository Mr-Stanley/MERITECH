import { sql } from "@vercel/postgres";

// Check if database connection is configured
if (!process.env.POSTGRES_URL) {
  console.warn(
    "Warning: POSTGRES_URL environment variable is not set. Database operations will fail."
  );
}

export { sql };

