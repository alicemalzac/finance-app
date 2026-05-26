import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { formatCurrency, MONTHS_PT } from '../utils/format';
import MonthSelector from '../components/MonthSelector';
import { useLatestMonth } from '../utils/useLatestMonth';

const emptyNewCat = { name: '', monthly_goal: '' };

export default function GastosVariaveis() {
  const { year, setYear, month, setMonth } = useLatestMonth();
  const [monthId, setMonthId] = useState(null);
  const [spending, setSpending] = useState([]);
  const [editingAmount, setEditingAmount] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [amountVal, setAmountVal] = useState('');
  const [goalVal, setGoalVal] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCat, setNewCat] = useState(emptyNewCat);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!year || !month) return;
    setLoading(true);
    try {
      const mRes = await api.get(`/months/${year}/${month}`);
      setMonthId(mRes.data.id);
      const sRes = await api.get(`/expenses/category-spending/${mRes.data.id}`);
      setSpending(sRes.data);
    } catch { setSpending([]); }
    setLoading(false);
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const saveAmount = async (catId, val) => {
    await api.put(`/expenses/category-spending/${monthId}/${catId}`, { amount: Number(val) });
    setEditingAmount(null);
    load();
  };

  const saveGoal = async (catId, val) => {
    const cat = spending.find(c => c.id === catId);
    await api.put(`/expenses/categories/${catId}`, { name: cat.name, monthly_goal: Number(val) });
    setEditingGoal(null);
    load();
  };

  const addCategory = async () => {
    if (!newCat.name.trim()) return;
    await api.post('/expenses/categories', { name: newCat.name.trim(), monthly_goal: Number(newCat.monthly_goal) || 0 });
    setNewCat(emptyNewCat);
    setShowAddCat(false);
    load();
  };

  const totalMeta = spending.reduce((s, c) => s + (c.monthly_goal || 0), 0);
  const totalGasto = spending.reduce((s, c) => s + (c.amount || 0), 0);

  const statusColor = (amount, goal) => {
    if (!goal) return '#64748b';
    if (amount <= goal) return '#22c55e';
    if (amount <= goal * 1.1) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#1e293b' }}>Gastos Variáveis — {MONTHS_PT[month - 1]} {year}</h1>
        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Meta Total', value: totalMeta, color: '#3b82f6' },
          { label: 'Gasto Total', value: totalGasto, color: totalGasto > totalMeta ? '#ef4444' : '#22c55e' },
          { label: 'Saldo', value: totalMeta - totalGasto, color: totalMeta - totalGasto >= 0 ? '#22c55e' : '#ef4444' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `3px solid ${c.color}` }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color, marginTop: 4 }}>{formatCurrency(c.value)}</div>
          </div>
        ))}
      </div>

      {/* Actions row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={() => setShowAddCat(true)}
          style={{ padding: '8px 18px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          + Nova Categoria
        </button>
      </div>

      {/* Add category modal */}
      {showAddCat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, color: '#1e293b' }}>Nova Categoria</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Nome</label>
                <input autoFocus value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') addCategory(); }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Meta Mensal (R$)</label>
                <input type="number" value={newCat.monthly_goal} onChange={e => setNewCat(p => ({ ...p, monthly_goal: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowAddCat(false); setNewCat(emptyNewCat); }}
                style={{ padding: '8px 18px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={addCategory}
                style={{ padding: '8px 18px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* Categories table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Categoria', 'Meta', 'Gasto', 'Progresso', 'Saldo'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Categoria' ? 'left' : 'right', color: '#374151', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spending.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Nenhuma categoria cadastrada</td></tr>
            )}
            {spending.map(cat => {
              const diff = (cat.monthly_goal || 0) - (cat.amount || 0);
              const pct = cat.monthly_goal > 0 ? Math.min(100, Math.round((cat.amount / cat.monthly_goal) * 100)) : null;
              const color = statusColor(cat.amount, cat.monthly_goal);
              return (
                <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px', color: '#374151', fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    {editingGoal === cat.id
                      ? <input autoFocus value={goalVal} type="number"
                          onChange={e => setGoalVal(e.target.value)}
                          onBlur={() => saveGoal(cat.id, goalVal)}
                          onKeyDown={e => { if (e.key === 'Enter') saveGoal(cat.id, goalVal); if (e.key === 'Escape') setEditingGoal(null); }}
                          style={{ width: 90, padding: '2px 6px', borderRadius: 4, border: '1px solid #38bdf8', fontSize: 13, textAlign: 'right' }} />
                      : <span onClick={() => { setEditingGoal(cat.id); setGoalVal(String(cat.monthly_goal || 0)); }}
                          style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 500 }} title="Clique para editar">
                          {formatCurrency(cat.monthly_goal)}
                        </span>
                    }
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    {editingAmount === cat.id
                      ? <input autoFocus value={amountVal} type="number"
                          onChange={e => setAmountVal(e.target.value)}
                          onBlur={() => saveAmount(cat.id, amountVal)}
                          onKeyDown={e => { if (e.key === 'Enter') saveAmount(cat.id, amountVal); if (e.key === 'Escape') setEditingAmount(null); }}
                          style={{ width: 90, padding: '2px 6px', borderRadius: 4, border: '1px solid #38bdf8', fontSize: 13, textAlign: 'right' }} />
                      : <span onClick={() => { setEditingAmount(cat.id); setAmountVal(String(cat.amount || 0)); }}
                          style={{ cursor: 'pointer', color, fontWeight: 500 }} title="Clique para editar">
                          {formatCurrency(cat.amount)}
                        </span>
                    }
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    {pct !== null ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                        <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6, width: 80 }}>
                          <div style={{ height: '100%', borderRadius: 4, background: color, width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color }}>{pct}%</span>
                      </div>
                    ) : <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', color: diff >= 0 ? '#22c55e' : '#ef4444', fontWeight: 500 }}>
                    {formatCurrency(diff)}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0', fontWeight: 700 }}>
              <td style={{ padding: '12px 16px', color: '#1e293b' }}>TOTAL</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#3b82f6' }}>{formatCurrency(totalMeta)}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: totalGasto > totalMeta ? '#ef4444' : '#22c55e' }}>{formatCurrency(totalGasto)}</td>
              <td></td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: totalMeta - totalGasto >= 0 ? '#22c55e' : '#ef4444' }}>{formatCurrency(totalMeta - totalGasto)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
        Clique nos valores de Meta ou Gasto para editar diretamente.
      </p>
    </div>
  );
}
