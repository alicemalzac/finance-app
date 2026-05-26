import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { formatCurrency, MONTHS_PT } from '../utils/format';
import MonthSelector from '../components/MonthSelector';
import { useLatestMonth } from '../utils/useLatestMonth';
import { useCategories } from '../utils/useCategories';

const emptyForm = { day: '', description: '', amount: '', category: '', subcategory: '' };

export default function Dinheiro() {
  const { year, setYear, month, setMonth } = useLatestMonth();
  const categories = useCategories();
  const [monthId, setMonthId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!year || !month) return;
    setLoading(true);
    try {
      const mRes = await api.get(`/months/${year}/${month}`);
      setMonthId(mRes.data.id);
      const tRes = await api.get(`/cash/${mRes.data.id}`);
      setTransactions(tRes.data);
    } catch { setTransactions([]); }
    setLoading(false);
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = tx => {
    setForm({ day: tx.day, description: tx.description, amount: tx.amount, category: tx.category || '', subcategory: tx.subcategory || '' });
    setEditId(tx.id); setShowForm(true);
  };
  const save = async () => {
    if (!form.description || !form.amount) return;
    if (editId) await api.put(`/cash/${editId}`, form);
    else await api.post(`/cash/${monthId}`, form);
    setShowForm(false); load();
  };
  const del = async id => { if (!confirm('Remover?')) return; await api.delete(`/cash/${id}`); load(); };

  const total = transactions.reduce((s, t) => s + t.amount, 0);

  let runningBalance = 0;
  const txsWithBalance = transactions.map(t => {
    runningBalance -= t.amount;
    return { ...t, balance: runningBalance };
  });

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#1e293b' }}>Dinheiro / Débito — {MONTHS_PT[month-1]}</h1>
        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: '3px solid #ef4444', minWidth: 160 }}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Total Gasto</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>{formatCurrency(total)}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: '3px solid #64748b', minWidth: 160 }}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Lançamentos</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#374151', marginTop: 4 }}>{transactions.length}</div>
        </div>
        <button onClick={openAdd} style={{ marginLeft: 'auto', alignSelf: 'center', padding: '10px 20px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          + Novo Gasto
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, color: '#1e293b' }}>{editId ? 'Editar' : 'Novo'} Gasto</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Dia</label>
                <input
                  type="date"
                  value={form.day && year && month
                    ? `${year}-${String(month).padStart(2,'0')}-${String(form.day).padStart(2,'0')}`
                    : ''}
                  min={`${year}-${String(month).padStart(2,'0')}-01`}
                  max={`${year}-${String(month).padStart(2,'0')}-31`}
                  onChange={e => {
                    const d = e.target.value ? new Date(e.target.value + 'T12:00:00').getDate() : '';
                    setForm(p => ({ ...p, day: d }));
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              {[['Descrição', 'description', 'text'], ['Valor (R$)', 'amount', 'number'], ['Subcategoria', 'subcategory', 'text']].map(([label, field, type]) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Categoria</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
                  <option value="">Sem categoria</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px 18px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={save} style={{ padding: '8px 18px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Dia','Descrição','Valor','Categoria','Subcategoria','Saldo',''].map(h => (
                <th key={h} style={{ padding: '11px 12px', textAlign: h === 'Valor' || h === 'Saldo' ? 'right' : 'left', color: '#374151', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {txsWithBalance.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Nenhum lançamento este mês</td></tr>
            )}
            {txsWithBalance.map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '9px 12px', color: '#64748b' }}>{tx.day}</td>
                <td style={{ padding: '9px 12px', color: '#374151' }}>{tx.description}</td>
                <td style={{ padding: '9px 12px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>{formatCurrency(tx.amount)}</td>
                <td style={{ padding: '9px 12px', color: '#64748b' }}>{tx.category || '—'}</td>
                <td style={{ padding: '9px 12px', color: '#64748b' }}>{tx.subcategory || '—'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'right', color: tx.balance >= 0 ? '#22c55e' : '#ef4444', fontWeight: 500 }}>{formatCurrency(tx.balance)}</td>
                <td style={{ padding: '9px 12px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(tx)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '3px 7px', fontSize: 11 }}>✏️</button>
                    <button onClick={() => del(tx.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '3px 7px', fontSize: 11, color: '#ef4444' }}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
