import { createClient } from '@libsql/client';

const tursoUrl = import.meta.env.STORAGE_URL || '';
const tursoToken = import.meta.env.STORAGE_AUTH_TOKEN || '';

if (!tursoUrl) {
  console.warn('Turso credentials not found.');
}

export const turso = tursoUrl
  ? createClient({
      url: tursoUrl,
      authToken: tursoToken || undefined,
    })
  : null;
