import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.STORAGE_URL!,
  authToken: process.env.STORAGE_AUTH_TOKEN
});

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const result = await client.execute("CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");

  return Response.json({ success: true, result: result.rows });
}

export const config = {
  runtime: 'nodejs',
};
