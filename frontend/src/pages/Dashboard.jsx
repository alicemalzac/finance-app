import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { formatCurrency, MONTHS_PT } from '../utils/format';
import MonthSelector from '../components/MonthSelector';
import { useLatestMonth } from '../utils/useLatestMonth';

const Card = ({ title, value, color, sub }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{title}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: color, margin: '6px 0 2px' }}>{formatCurrency(value)}</div>
    {sub && <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>}
  </div>
);

const FIXED_CATEGORIES_ORDER = [
  'Aluguel','Contador','Claro','Brisanet','Enel','Terapia','Unimed',
  'Cartão Bradesco','Cartão Santander','Imposto CNPJ','Picpay',
  'Financiamento Carro','IPVA','Mãe','Pai','Ingresso HS','Mercado Pago','Luiz','Extra'
];

export default function Dashboard() {
  const { year, setYear, month, setMonth } = useLatestMonth();
  const [data, setData] = useState(null);
  const [varTotal, setVarTotal] = useState(0);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '' });

  const load = useCallback(async () => {
    if (!year || !month) return;
    setLoading(true);
    try {
      const res = await api.get(`/months/${year}/${month}`);
      setData(res.data);
      const [cardRes, cashRes] = await Promise.all([
        api.get(`/cards/transactions/${res.data.id}`),
        api.get(`/cash/${res.data.id}`),
      ]);
      setVarTotal(
        cardRes.data.reduce((s, t) => s + t.amount, 0) +
        cashRes.data.reduce((s, t) => s + t.amount, 0)
      );
    } catch {
      setData(null);
    }
    setLoading(false);
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const saveIncome = async (field, value) => {
    await api.put(`/months/${year}/${month}`, { ...data, [field]: Number(value) });
    load();
  };

  const saveExpense = async (id, amount) => {
    await api.put(`/expenses/${id}`, { category: data.fixed_expenses.find(e => e.id === id)?.category, amount: Number(amount) });
    load();
  };

  const deleteExpense = async (id) => {
    if (!confirm('Remover esta conta?')) return;
    await api.delete(`/expenses/${id}`);
    load();
  };

  const addExpense = async () => {
    if (!newExpense.category) return;
    await api.post(`/expenses/${data.id}`, { category: newExpense.category, amount: Number(newExpense.amount) });
    setShowAddExpense(false);
    setNewExpense({ category: '', amount: '' });
    load();
  };

  const startEdit = (key, val) => { setEditing(key); setEditVal(String(val)); };
  const commitEdit = (key) => {
    if (key.startsWith('expense-')) saveExpense(Number(key.split('-')[1]), editVal);
    else saveIncome(key, editVal);
    setEditing(null);
  };

  const EditableCell = ({ editKey, value }) => (
    editing === editKey
      ? <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
          onBlur={() => commitEdit(editKey)} onKeyDown={e => e.key === 'Enter' && commitEdit(editKey)}
          style={{ width: 110, padding: '2px 6px', borderRadius: 4, border: '1px solid #38bdf8', fontSize: 13, textAlign: 'right' }} />
      : <span onClick={() => startEdit(editKey, value)} style={{ cursor: 'pointer', padding: '2px 4px', borderRadius: 4 }}
          title="Clique para editar">{formatCurrency(value)}</span>
  );

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Carregando...</div>;
  if (!data) return <div style={{ padding: 40, color: '#ef4444' }}>Mês não encontrado.</div>;

  const totalIncome = data.total_income;
  const balance = data.balance;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#1e293b' }}>{MONTHS_PT[month - 1]} {year}</h1>
        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      {/* Cards resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <Card title="Salário" value={data.salary} color="#22c55e" sub="Renda fixa mensal" />
        <Card title="Total de Receitas" value={totalIncome} color="#3b82f6" sub={`Inclui extras e saldo anterior`} />
        <Card title="Total de Gastos" value={data.total_fixed} color="#f59e0b" />
        <Card title="Saldo do Mês" value={balance} color={balance >= 0 ? '#22c55e' : '#ef4444'} sub={balance >= 0 ? 'Positivo ✓' : 'Negativo ⚠️'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Receitas */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>Recebimentos</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
              {[['Salário', 'salary'], ['Extra', 'extra'], ['Philippe', 'philippe'], ['Saldo Anterior', 'previous_balance']].map(([label, field]) => (
                <tr key={field} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0', color: '#374151' }}>{label}</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: '#22c55e', fontWeight: 500 }}>
                    <EditableCell editKey={field} value={data[field]} />
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid #e2e8f0', fontWeight: 700 }}>
                <td style={{ padding: '10px 0', color: '#1e293b' }}>TOTAL</td>
                <td style={{ padding: '10px 0', textAlign: 'right', color: '#3b82f6' }}>{formatCurrency(totalIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Contas fixas */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>Contas Fixas</h2>
            <button onClick={() => setShowAddExpense(true)} style={{ padding: '4px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Adicionar</button>
          </div>

          {showAddExpense && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input value={newExpense.category} onChange={e => setNewExpense(p => ({ ...p, category: e.target.value }))}
                placeholder="Categoria" style={{ flex: 1, padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13 }} />
              <input type="number" value={newExpense.amount} onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))}
                placeholder="Valor" style={{ width: 90, padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13 }} />
              <button onClick={addExpense} style={{ padding: '4px 8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>✓</button>
              <button onClick={() => setShowAddExpense(false)} style={{ padding: '4px 8px', background: '#e2e8f0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>✕</button>
            </div>
          )}

          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                {data.fixed_expenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '7px 0', color: '#374151' }}>{exp.category}</td>
                    <td style={{ padding: '7px 0', textAlign: 'right', color: '#f59e0b', fontWeight: 500 }}>
                      <EditableCell editKey={`expense-${exp.id}`} value={exp.amount} />
                    </td>
                    <td style={{ padding: '7px 0', paddingLeft: 8 }}>
                      <button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12 }}>✕</button>
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #e2e8f0', fontWeight: 700 }}>
                  <td style={{ padding: '10px 0', color: '#1e293b' }}>TOTAL</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#ef4444' }}>{formatCurrency(data.total_fixed)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 50/30/20 */}
      {(() => {
        const base = (data.salary || 0) + (data.extra || 0) + (data.philippe || 0);
        const buckets = [
          { label: 'Necessidades', pct: 50, actual: data.total_fixed, color: '#3b82f6', hint: 'Contas fixas' },
          { label: 'Desejos', pct: 30, actual: varTotal, color: '#f59e0b', hint: 'Cartões + dinheiro' },
          { label: 'Poupança', pct: 20, actual: Math.max(0, base - data.total_fixed - varTotal), color: '#22c55e', hint: 'Sobra do mês' },
        ];
        return (
          <div style={{ marginTop: 20, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>Regra 50/30/20</h2>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Base: {formatCurrency(base)} (salário + extras)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {buckets.map(b => {
                const target = base * (b.pct / 100);
                const used = base > 0 ? Math.min(100, (b.actual / target) * 100) : 0;
                const over = b.actual > target;
                return (
                  <div key={b.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{b.label} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({b.pct}% — {b.hint})</span></span>
                      <span style={{ fontSize: 13, color: over ? '#ef4444' : '#64748b' }}>
                        {formatCurrency(b.actual)} / {formatCurrency(target)}
                        <span style={{ marginLeft: 6, fontWeight: 700, color: over ? '#ef4444' : '#22c55e' }}>
                          {base > 0 ? `${Math.round((b.actual / target) * 100)}%` : '—'}
                        </span>
                      </span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 6, width: `${used}%`, background: over ? '#ef4444' : b.color, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
