import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
      if (!gate_id || !recipient || amount === undefined || !type || !status) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      let finalAmount = parseFloat(amount);
      if (type === 'withdrawal' && finalAmount > 0) {
        finalAmount = -finalAmount;
      } else if (type === 'deposit' && finalAmount < 0) {
        finalAmount = Math.abs(finalAmount);
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          gate_id: parseInt(gate_id),
          recipient,
          amount: finalAmount,
          type,
          status,
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
      if (!id || !gate_id || !recipient || amount === undefined || !type || !status) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      let finalAmount = parseFloat(amount);
      if (type === 'withdrawal' && finalAmount > 0) {
        finalAmount = -finalAmount;
      } else if (type === 'deposit' && finalAmount < 0) {
        finalAmount = Math.abs(finalAmount);
      }

      const updateData = {
        gate_id: parseInt(gate_id),
        recipient,
        amount: finalAmount,
        type,
        status,
        comments: comments || '',
        verified: !!verified
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
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PATCH') {
      const { id, archived } = req.body;
      if (!id || archived === undefined) {
        return res.status(400).json({ error: 'ID and archived status are required' });
      }

      const updateData = {
        archived: !!archived,
        archived_at: !!archived ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
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
