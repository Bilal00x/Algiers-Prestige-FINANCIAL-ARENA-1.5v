import { supabase } from './supabase';
import type { Gate, Transaction } from '../contexts/FinancialContext';

// ---- Gates ----
export async function fetchGates(): Promise<Gate[]> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: gates, error: gatesError } = await supabase
    .from('gates')
    .select('*')
    .order('id', { ascending: true });
  if (gatesError) throw gatesError;

  const { data: txs, error: txsError } = await supabase
    .from('transactions')
    .select('gate_id, amount');
  if (txsError) throw txsError;

  const gateBalances = (txs || []).reduce<Record<number, number>>((acc, tx) => {
    const gId = tx.gate_id;
    const amt = parseFloat(tx.amount) || 0;
    acc[gId] = (acc[gId] || 0) + amt;
    return acc;
  }, {});

  return (gates || []).map(g => ({
    ...g,
    balance: parseFloat(g.initial_balance || 0) + (gateBalances[g.id] || 0),
    currency: g.currency || 'DZD',
  }));
}

export async function createGateApi(gate: { name: string; code: string; initial_balance: number }): Promise<Gate> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('gates')
    .insert({
      name: gate.name,
      code: gate.code,
      initial_balance: parseFloat(gate.initial_balance as any) || 0,
      currency: 'DZD',
    })
    .select()
    .single();
  if (error) throw error;
  return { ...data, balance: data.initial_balance, currency: data.currency || 'DZD' };
}

export async function updateGateApi(id: number, gate: { name: string; code: string; initial_balance: number }): Promise<Gate> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('gates')
    .update({
      name: gate.name,
      code: gate.code,
      initial_balance: parseFloat(gate.initial_balance as any) || 0,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return { ...data, balance: data.initial_balance, currency: data.currency || 'DZD' };
}

export async function deleteGateApi(id: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error: txError } = await supabase
    .from('transactions')
    .delete()
    .eq('gate_id', id);
  if (txError) throw txError;

  const { error } = await supabase
    .from('gates')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ---- Transactions ----
export async function fetchTransactions(): Promise<Transaction[]> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: txs, error: txsError } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });
  if (txsError) throw txsError;

  const { data: gates, error: gatesError } = await supabase
    .from('gates')
    .select('id, name, code');
  if (gatesError) throw gatesError;

  const gatesMap = (gates || []).reduce<Record<number, { name: string; code: string }>>((acc, g) => {
    acc[g.id] = g;
    return acc;
  }, {});

  return (txs || []).map(tx => ({
    ...tx,
    gate: gatesMap[tx.gate_id] || { name: 'Deleted Gate', code: 'N/A' },
  }));
}

export async function createTransactionApi(
  tx: Omit<Transaction, 'id' | 'created_at' | 'gate' | 'archived' | 'archived_at'>
): Promise<Transaction> {
  if (!supabase) throw new Error('Supabase not initialized');

  let finalAmount = parseFloat(tx.amount as any);
  if (tx.type === 'withdrawal' && finalAmount > 0) {
    finalAmount = -finalAmount;
  } else if (tx.type === 'deposit' && finalAmount < 0) {
    finalAmount = Math.abs(finalAmount);
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      gate_id: tx.gate_id,
      recipient: tx.recipient,
      amount: finalAmount,
      type: tx.type,
      status: tx.status,
      comments: tx.comments || '',
      verified: tx.verified || false,
      archived: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTransactionApi(
  id: number,
  tx: Partial<Transaction>
): Promise<Transaction> {
  if (!supabase) throw new Error('Supabase not initialized');

  const updateData: Record<string, any> = {};
  if (tx.gate_id !== undefined) updateData.gate_id = tx.gate_id;
  if (tx.recipient !== undefined) updateData.recipient = tx.recipient;
  if (tx.amount !== undefined) {
    let finalAmount = parseFloat(tx.amount as any);
    if (tx.type === 'withdrawal' && finalAmount > 0) {
      finalAmount = -finalAmount;
    } else if (tx.type === 'deposit' && finalAmount < 0) {
      finalAmount = Math.abs(finalAmount);
    }
    updateData.amount = finalAmount;
  }
  if (tx.type !== undefined) updateData.type = tx.type;
  if (tx.status !== undefined) updateData.status = tx.status;
  if (tx.comments !== undefined) updateData.comments = tx.comments;
  if (tx.verified !== undefined) updateData.verified = tx.verified;
  if (tx.created_at !== undefined) updateData.created_at = tx.created_at;
  if (tx.archived !== undefined) {
    updateData.archived = tx.archived;
    updateData.archived_at = tx.archived ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransactionApi(id: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function archiveTransactionApi(id: number, archived: boolean): Promise<Transaction> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('transactions')
    .update({
      archived,
      archived_at: archived ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
