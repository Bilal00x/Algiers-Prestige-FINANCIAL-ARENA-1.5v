import supabase from './db-client.js';

export default async function handler(req, res) {
  // Set security and CORS headers
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'interest-cohort=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  // Simple token-based auth (replace with JWT in production)
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : '';
  const validToken = process.env.API_TOKEN || '';
  if (!validToken || token !== validToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data: gates, error: gatesError } = await supabase
        .from('gates')
        .select('*')
        .order('id', { ascending: true });
      if (gatesError) throw gatesError;

      const { data: txs, error: txsError } = await supabase
        .from('transactions')
        .select('gate_id, amount');
      if (txsError) throw txsError;

      const gateBalances = (txs || []).reduce((acc, tx) => {
        const gId = tx.gate_id;
        const amt = parseFloat(tx.amount) || 0;
        acc[gId] = (acc[gId] || 0) + amt;
        return acc;
      }, {});

      const gatesWithBalance = (gates || []).map(g => ({
        ...g,
        balance: parseFloat(g.initial_balance || 0) + (gateBalances[g.id] || 0)
      }));

      return res.status(200).json(gatesWithBalance);
    }

    if (req.method === 'POST') {
      const { name, code, initial_balance } = req.body;
      // Input validation
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Invalid name' });
      }
      if (typeof code !== 'string' || !/^[A-Z]{3}$/i.test(code)) {
        return res.status(400).json({ error: 'Invalid code (expected 3-letter currency code)' });
      }
      const initBal = parseFloat(initial_balance);
      if (isNaN(initBal)) {
        return res.status(400).json({ error: 'Invalid initial_balance' });
      }
      const { data, error } = await supabase
        .from('gates')
        .insert({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          initial_balance: initBal
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, name, code, initial_balance } = req.body;
      // Validate id as integer
      const gateId = parseInt(id);
      if (isNaN(gateId) || typeof name !== 'string' || !name.trim() || typeof code !== 'string' || !/^[A-Z]{3}$/i.test(code)) {
        return res.status(400).json({ error: 'Invalid input for gate update' });
      }
      const initBal = parseFloat(initial_balance);
      if (isNaN(initBal)) {
        return res.status(400).json({ error: 'Invalid initial_balance' });
      }
      const { data, error } = await supabase
        .from('gates')
        .update({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          initial_balance: initBal
        })
        .eq('id', gateId)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const gateId = parseInt(id);
      if (isNaN(gateId)) {
        return res.status(400).json({ error: 'Invalid gate ID' });
      }
      // Delete associated transactions first
      await supabase.from('transactions').delete().eq('gate_id', gateId);
      // Delete the gate
      const { error } = await supabase.from('gates').delete().eq('id', gateId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Gates API error:', err);
    res.status(500).json({ error: err.message });
  }
}
