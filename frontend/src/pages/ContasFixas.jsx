import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { formatCurrency, MONTHS_PT } from '../utils/format';
import { useLatestMonth } from '../utils/useLatestMonth';

export default function ContasFixas() {
  const { year } = useLatestMonth();
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ month: '', category: '', amount: '' });

  const load = useCallback(async () => {
    if (!year) return;
    setLoading(true);
    try {
      const all = await Promise.all(
        Array.from({ length: 12 }, (_, i) => api.get(`/months/${year}/${i + 1}`).then(r => r.data).catch(() => null))
      );
      setMonths(all.filter(Boolean));
    } catch { setMonths([]); }
    setLoading(false);
  }, [year]);

  useEffect(() => { load(); }, [load]);

  const addExpense = async () => {
    if (!form.month || !form.category || !form.amount) return;
    const m = months.find(m => m.month === Number(form.month));
    if (!m) return;
    await api.post(`/expenses/${m.id}`, { category: form.category, amount: Number(form.amount) });
    setShowForm(false);
    setForm({ month: '', category: '', amount: '' });
    load();
  };

  const allCategories = [...new Set(months.flatMap(m => (m.fixed_expenses || []).map(e => e.category)))];
  const getAmount = (m, cat) => m.fixed_expenses?.find(e => e.category === cat)?.amount ?? null;

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#1e293b' }}>Histórico Anual — Contas Fixas {year}</h1>
        <button onClick={() => setShowForm(true)}
          style={{ padding: '8px 18px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          + Nova Conta
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, color: '#1e293b' }}>Nova Conta Fixa</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Mês</label>
                <select value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
                  <option value="">Selecione</option>
                  {months.map(m => <option key={m.month} value={m.month}>{MONTHS_PT[m.month - 1]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Categoria</label>
                <input autoFocus value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Valor (R$)</label>
                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px 18px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={addExpense} style={{ padding: '8px 18px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {allCategories.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          Nenhuma conta fixa cadastrada. Clique em "+ Nova Conta" para adicionar.
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#1e293b' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#e2e8f0', fontWeight: 600, position: 'sticky', left: 0, background: '#1e293b', minWidth: 160 }}>Categoria</th>
                {months.map(m => (
                  <th key={m.month} style={{ padding: '12px 10px', textAlign: 'right', color: '#e2e8f0', fontWeight: 600, minWidth: 100 }}>
                    {MONTHS_PT[m.month - 1].slice(0, 3)}
                  </th>
                ))}
                <th style={{ padding: '12px 10px', textAlign: 'right', color: '#38bdf8', fontWeight: 700, minWidth: 100 }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {allCategories.map((cat, idx) => {
                const rowTotal = months.reduce((s, m) => s + (getAmount(m, cat) ?? 0), 0);
                return (
                  <tr key={cat} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '9px 16px', color: '#374151', fontWeight: 500, position: 'sticky', left: 0, background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>{cat}</td>
                    {months.map(m => {
                      const val = getAmount(m, cat);
                      return (
                        <td key={m.month} style={{ padding: '9px 10px', textAlign: 'right', color: val ? '#f59e0b' : '#d1d5db' }}>
                          {val != null ? formatCurrency(val) : '—'}
                        </td>
                      );
                    })}
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#1e293b', fontWeight: 700 }}>{formatCurrency(rowTotal)}</td>
                  </tr>
                );
              })}
              <tr style={{ background: '#0f172a', borderTop: '2px solid #334155' }}>
                <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 700, position: 'sticky', left: 0, background: '#0f172a' }}>TOTAL MENSAL</td>
                {months.map(m => (
                  <td key={m.month} style={{ padding: '12px 10px', textAlign: 'right', color: '#ef4444', fontWeight: 700 }}>
                    {formatCurrency(m.total_fixed)}
                  </td>
                ))}
                <td style={{ padding: '12px 10px', textAlign: 'right', color: '#ef4444', fontWeight: 700 }}>
                  {formatCurrency(months.reduce((s, m) => s + (m.total_fixed || 0), 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
