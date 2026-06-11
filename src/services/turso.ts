import { createClient } from '@libsql/client';

const tursoUrl = import.meta.env.TURSO_DATABASE_URL || '';
const tursoToken = import.meta.env.TURSO_AUTH_TOKEN || '';

if (!tursoUrl) {
  console.warn('Turso credentials not found.');
}

export const turso = tursoUrl
  ? createClient({
      url: tursoUrl,
      authToken: tursoToken || undefined,
    })
  : null;
