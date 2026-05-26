import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { formatCurrency, MONTHS_PT } from '../utils/format';
import MonthSelector from '../components/MonthSelector';
import { useLatestMonth } from '../utils/useLatestMonth';

export default function Metas() {
  const { year, setYear, month, setMonth } = useLatestMonth();
  const [monthId, setMonthId] = useState(null);
  const [spending, setSpending] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
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

  const save = async (categoryId, amount) => {
    await api.put(`/expenses/category-spending/${monthId}/${categoryId}`, { amount: Number(amount) });
    load();
  };

  const totalMeta = spending.reduce((s, c) => s + (c.monthly_goal || 0), 0);
  const totalGasto = spending.reduce((s, c) => s + (c.amount || 0), 0);

  const statusColor = (amount, goal) => {
    if (!goal) return '#64748b';
    if (amount <= goal) return '#22c55e';
    if (amount <= goal * 1.2) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#1e293b' }}>Metas por Categoria</h1>
        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      {/* Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Meta Total', value: totalMeta, color: '#3b82f6' },
          { label: 'Gasto Total', value: totalGasto, color: totalGasto > totalMeta ? '#ef4444' : '#22c55e' },
          { label: 'Diferença', value: totalMeta - totalGasto, color: totalMeta - totalGasto >= 0 ? '#22c55e' : '#ef4444' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `3px solid ${c.color}` }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color, marginTop: 4 }}>{formatCurrency(c.value)}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#374151', fontWeight: 600 }}>Categoria</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: '#374151', fontWeight: 600 }}>Meta</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: '#374151', fontWeight: 600 }}>Realizado</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: '#374151', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: '#374151', fontWeight: 600 }}>Diferença</th>
            </tr>
          </thead>
          <tbody>
            {spending.map(cat => {
              const diff = (cat.monthly_goal || 0) - (cat.amount || 0);
              const pct = cat.monthly_goal ? Math.round((cat.amount / cat.monthly_goal) * 100) : null;
              return (
                <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px', color: '#374151', fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', color: '#3b82f6' }}>{formatCurrency(cat.monthly_goal)}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    {editing === cat.id
                      ? <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                          onBlur={() => { save(cat.id, editVal); setEditing(null); }}
                          onKeyDown={e => { if (e.key === 'Enter') { save(cat.id, editVal); setEditing(null); } }}
                          style={{ width: 90, padding: '2px 6px', borderRadius: 4, border: '1px solid #38bdf8', fontSize: 13, textAlign: 'right' }} />
                      : <span onClick={() => { setEditing(cat.id); setEditVal(String(cat.amount || 0)); }}
                          style={{ cursor: 'pointer', color: statusColor(cat.amount, cat.monthly_goal), fontWeight: 500 }}>
                          {formatCurrency(cat.amount)}
                        </span>
                    }
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    {cat.monthly_goal > 0 && (
                      <div>
                        <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6, width: 80, margin: '0 auto 4px' }}>
                          <div style={{ height: '100%', borderRadius: 4, background: statusColor(cat.amount, cat.monthly_goal),
                            width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: statusColor(cat.amount, cat.monthly_goal) }}>{pct}%</span>
                      </div>
                    )}
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
    </div>
  );
}
