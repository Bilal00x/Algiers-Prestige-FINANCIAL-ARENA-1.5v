import supabase from './db-client.js';

export default async function handler(req, res) {
  // Set security and CORS headers
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
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
      const { data: txs, error: txsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (txsError) throw txsError;

      const { data: gates, error: gatesError } = await supabase
        .from('gates')
        .select('id, name, code');
      if (gatesError) throw gatesError;

      const gatesMap = (gates || []).reduce((acc, g) => {
        acc[g.id] = g;
        return acc;
      }, {});

      const txsWithGate = (txs || []).map(tx => ({
        ...tx,
        gate: gatesMap[tx.gate_id] || { name: 'Deleted Gate', code: 'N/A' }
      }));

      return res.status(200).json(txsWithGate);
    }

    if (req.method === 'POST') {
      const { gate_id, recipient, amount, type, status, comments, verified } = req.body;
      // Basic input validation
      const gateId = parseInt(gate_id);
      if (isNaN(gateId)) {
        return res.status(400).json({ error: 'Invalid gate_id' });
      }
      if (typeof recipient !== 'string' || !recipient.trim()) {
        return res.status(400).json({ error: 'Invalid recipient' });
      }
      const amt = parseFloat(amount);
      if (isNaN(amt)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      const allowedTypes = ['deposit', 'withdrawal', 'transfer'];
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid transaction type' });
      }
      if (typeof status !== 'string' || !status.trim()) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      let finalAmount = amt;
      if (type === 'withdrawal' && finalAmount > 0) {
        finalAmount = -finalAmount;
      } else if (type === 'deposit' && finalAmount < 0) {
        finalAmount = Math.abs(finalAmount);
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          gate_id: gateId,
          recipient: recipient.trim(),
          amount: finalAmount,
          type,
          status: status.trim(),
          comments: comments || '',
          verified: verified === undefined ? false : !!verified,
          archived: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, gate_id, recipient, amount, type, status, comments, verified, created_at, archived, archived_at } = req.body;
      // Validate required fields
      const txId = parseInt(id);
      const gateId = parseInt(gate_id);
      if (isNaN(txId) || isNaN(gateId)) {
        return res.status(400).json({ error: 'Invalid transaction or gate ID' });
      }
      if (typeof recipient !== 'string' || !recipient.trim()) {
        return res.status(400).json({ error: 'Invalid recipient' });
      }
      const amt = parseFloat(amount);
      if (isNaN(amt)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      const allowedTypes = ['deposit', 'withdrawal', 'transfer'];
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid transaction type' });
      }
      if (typeof status !== 'string' || !status.trim()) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      let finalAmount = amt;
      if (type === 'withdrawal' && finalAmount > 0) {
        finalAmount = -finalAmount;
      } else if (type === 'deposit' && finalAmount < 0) {
        finalAmount = Math.abs(finalAmount);
      }

      const updateData: Record<string, any> = {
        gate_id: gateId,
        recipient: recipient.trim(),
        amount: finalAmount,
        type,
        status: status.trim(),
        comments: comments || '',
        verified: !!verified,
      };
      if (created_at) {
        updateData.created_at = created_at;
      }
      if (archived !== undefined) {
        updateData.archived = !!archived;
      }
      if (archived_at !== undefined) {
        updateData.archived_at = archived_at;
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', txId)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const txId = parseInt(id);
      if (isNaN(txId)) {
        return res.status(400).json({ error: 'Invalid transaction ID' });
      }
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', txId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PATCH') {
      const { id, archived } = req.body;
      const txId = parseInt(id);
      if (isNaN(txId) || archived === undefined) {
        return res.status(400).json({ error: 'Invalid ID or archived status' });
      }

      const updateData = {
        archived: !!archived,
        archived_at: !!archived ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', txId)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Transactions API error:', err);
    res.status(500).json({ error: err.message });
  }
}
