import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
      if (!name || !code) {
        return res.status(400).json({ error: 'Name and Code are required' });
      }
      const { data, error } = await supabase
        .from('gates')
        .insert({
          name,
          code,
          initial_balance: parseFloat(initial_balance) || 0
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, name, code, initial_balance } = req.body;
      if (!id || !name || !code) {
        return res.status(400).json({ error: 'ID, Name, and Code are required' });
      }
      const { data, error } = await supabase
        .from('gates')
        .update({
          name,
          code,
          initial_balance: parseFloat(initial_balance) || 0
        })
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
      // Delete associated transactions first
      await supabase.from('transactions').delete().eq('gate_id', id);
      // Delete the gate
      const { error } = await supabase.from('gates').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Gates API error:', err);
    res.status(500).json({ error: err.message });
  }
}
