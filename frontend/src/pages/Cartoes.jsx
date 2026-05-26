import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { formatCurrency, MONTHS_PT, MONTHS_SHORT, formatEndMonth } from '../utils/format';
import MonthSelector from '../components/MonthSelector';
import { useLatestMonth } from '../utils/useLatestMonth';
import { useCategories } from '../utils/useCategories';
const PAYMENT_TYPES = ['avista', 'parcelado', 'recorrente'];
const paymentLabel = { avista: 'À vista', parcelado: 'Parcelado', recorrente: 'Recorrente' };
const paymentColor = { avista: '#64748b', parcelado: '#f59e0b', recorrente: '#3b82f6' };
const emptyForm = { card_id: '', store: '', amount: '', installment_current: 1, installment_total: 1, category: '', subcategory: '', payment_type: 'avista', end_month: '' };

export default function Cartoes() {
  const { year, setYear, month, setMonth } = useLatestMonth();
  const categories = useCategories();
  const [monthId, setMonthId] = useState(null);
  const [cards, setCards] = useState([]);
  const [goals, setGoals] = useState([]);
  const [totals, setTotals] = useState({});
  const [txByCard, setTxByCard] = useState({});
  const [selectedCard, setSelectedCard] = useState('all');
  const [filter, setFilter] = useState('');
  const [editGoal, setEditGoal] = useState(null);
  const [goalVal, setGoalVal] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!year || !month) return;
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([api.get(`/months/${year}/${month}`), api.get('/cards/')]);
      setMonthId(mRes.data.id);
      setCards(cRes.data);
      const gRes = await api.get(`/cards/goals/${mRes.data.id}`);
      setGoals(gRes.data);
      const totalMap = {};
      const txMap = {};
      await Promise.all(cRes.data.map(async card => {
        const tRes = await api.get(`/cards/transactions/${mRes.data.id}?card_id=${card.id}`);
        totalMap[card.id] = tRes.data.reduce((s, t) => s + t.amount, 0);
        txMap[card.id] = tRes.data;
      }));
      setTotals(totalMap);
      setTxByCard(txMap);
    } catch { setCards([]); }
    setLoading(false);
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const saveGoal = async (cardId, amount) => {
    await api.put(`/cards/goals/${monthId}/${cardId}`, { goal_amount: Number(amount), target_months: 3 });
    load();
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = tx => {
    setForm({ card_id: tx.card_id, store: tx.store, amount: tx.amount,
      installment_current: tx.installment_current, installment_total: tx.installment_total,
      category: tx.category || '', subcategory: tx.subcategory || '',
      payment_type: tx.payment_type, end_month: tx.end_month || '' });
    setEditId(tx.id); setShowForm(true);
  };
  const save = async () => {
    if (!form.card_id || !form.store || !form.amount) return;
    if (editId) await api.put(`/cards/transactions/${editId}`, form);
    else await api.post(`/cards/transactions/${monthId}`, form);
    setShowForm(false); load();
  };
  const del = async id => { if (!confirm('Remover?')) return; await api.delete(`/cards/transactions/${id}`); load(); };

  const getGoal = cardId => goals.find(g => g.card_id === cardId);

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Carregando...</div>;

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  const allTx = cards.flatMap(c => (txByCard[c.id] || []).map(t => ({ ...t, card_name: c.name })));
  const filteredTx = (selectedCard === 'all' ? allTx : (txByCard[Number(selectedCard)] || []).map(t => {
    const c = cards.find(c => c.id === Number(selectedCard));
    return { ...t, card_name: c?.name };
  })).filter(t => !filter || t.store.toLowerCase().includes(filter.toLowerCase()) || (t.category || '').toLowerCase().includes(filter.toLowerCase()));

  const filteredTotal = filteredTx.reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#1e293b' }}>Cartões de Crédito</h1>
        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      {/* Resumo por cartão */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cards.length + 1}, 1fr)`, gap: 16, marginBottom: 24 }}>
        {cards.map(card => {
          const total = totals[card.id] ?? 0;
          const goal = getGoal(card.id);
          const pct = goal ? Math.round((total / goal.goal_amount) * 100) : null;
          const color = !goal ? '#64748b' : total <= goal.goal_amount ? '#22c55e' : '#ef4444';
          return (
            <div key={card.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>💳 {card.name}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color, margin: '6px 0 4px' }}>{formatCurrency(total)}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>Meta: {goal ? formatCurrency(goal.goal_amount) : '—'}</div>
              {pct !== null && (
                <div>
                  <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6 }}>
                    <div style={{ height: '100%', borderRadius: 4, background: color, width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <div style={{ fontSize: 11, color, marginTop: 2 }}>{pct}% da meta</div>
                </div>
              )}
              <div style={{ marginTop: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                {editGoal === card.id
                  ? <>
                      <input autoFocus value={goalVal} onChange={e => setGoalVal(e.target.value)}
                        style={{ flex: 1, padding: '4px 6px', borderRadius: 4, border: '1px solid #38bdf8', fontSize: 12 }} />
                      <button onClick={() => { saveGoal(card.id, goalVal); setEditGoal(null); }}
                        style={{ padding: '4px 8px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>✓</button>
                    </>
                  : <button onClick={() => { setEditGoal(card.id); setGoalVal(String(goal?.goal_amount ?? '')); }}
                      style={{ padding: '4px 10px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#374151' }}>
                      {goal ? 'Editar meta' : 'Definir meta'}
                    </button>
                }
              </div>
            </div>
          );
        })}
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Total Geral</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', margin: '6px 0' }}>{formatCurrency(grandTotal)}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Todos os cartões</div>
        </div>
      </div>

      {/* Lançamentos com CRUD */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>Lançamentos</h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={selectedCard} onChange={e => setSelectedCard(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, background: '#fff' }}>
              <option value="all">Todos os cartões</option>
              {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar..."
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, width: 140 }} />
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Total: <strong style={{ color: '#ef4444' }}>{formatCurrency(filteredTotal)}</strong>
            </span>
            <button onClick={openAdd}
              style={{ padding: '6px 14px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              + Novo
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Cartão','Estabelecimento','Valor','Forma','Parcela','Categoria','Encerra',''].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Valor' ? 'right' : 'left', color: '#374151', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTx.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Nenhum lançamento encontrado</td></tr>
              )}
              {filteredTx.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 500, color: '#374151' }}>{tx.card_name}</td>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{tx.store}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>{formatCurrency(tx.amount)}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, background: `${paymentColor[tx.payment_type]}20`, color: paymentColor[tx.payment_type], fontSize: 11, fontWeight: 600 }}>
                      {paymentLabel[tx.payment_type]}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', color: '#64748b' }}>
                    {tx.payment_type === 'parcelado' ? `${tx.installment_current}/${tx.installment_total}` : '—'}
                  </td>
                  <td style={{ padding: '8px 12px', color: '#64748b' }}>{tx.category || '—'}</td>
                  <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 12 }}>{formatEndMonth(tx.end_month) || '—'}</td>
                  <td style={{ padding: '8px 12px' }}>
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

      {/* Modal de formulário */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, color: '#1e293b' }}>{editId ? 'Editar' : 'Novo'} Lançamento</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Cartão</label>
                <select value={form.card_id} onChange={e => setForm(p => ({ ...p, card_id: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
                  <option value="">Selecione</option>
                  {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Forma</label>
                <select value={form.payment_type} onChange={e => setForm(p => ({ ...p, payment_type: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
                  {PAYMENT_TYPES.map(t => <option key={t} value={t}>{paymentLabel[t]}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Estabelecimento</label>
                <input type="text" value={form.store} onChange={e => setForm(p => ({ ...p, store: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Valor (R$)</label>
                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
              </div>

              {form.payment_type === 'parcelado' && (
                !editId ? (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Nº de Parcelas</label>
                    <input type="number" value={form.installment_total} onChange={e => setForm(p => ({ ...p, installment_total: e.target.value }))}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Parcela Atual</label>
                    <input type="number" value={form.installment_current} onChange={e => setForm(p => ({ ...p, installment_current: e.target.value }))}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                )
              )}

              {form.payment_type === 'parcelado' && editId && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Parcelas</label>
                  <input type="number" value={form.installment_total} onChange={e => setForm(p => ({ ...p, installment_total: e.target.value }))}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              )}

              {form.payment_type === 'parcelado' && !editId && (
                <div style={{ gridColumn: '1/-1', padding: '8px 12px', background: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: 12, color: '#166534' }}>✓ As parcelas seguintes serão criadas automaticamente nos meses seguintes.</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Categoria</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
                  <option value="">Sem categoria</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Subcategoria</label>
                <input type="text" value={form.subcategory} onChange={e => setForm(p => ({ ...p, subcategory: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Encerra em</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={form.end_month ? form.end_month.split('-')[1] || '' : ''}
                    onChange={e => {
                      const y = form.end_month ? form.end_month.split('-')[0] : String(new Date().getFullYear());
                      setForm(p => ({ ...p, end_month: e.target.value ? `${y}-${e.target.value}` : '' }));
                    }}
                    style={{ flex: 1, padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
                    <option value="">Sem encerramento</option>
                    {MONTHS_SHORT.map((m, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
                  </select>
                  <select
                    value={form.end_month ? form.end_month.split('-')[0] || '' : ''}
                    onChange={e => {
                      const mo = form.end_month ? form.end_month.split('-')[1] : '';
                      setForm(p => ({ ...p, end_month: mo ? `${e.target.value}-${mo}` : '' }));
                    }}
                    style={{ width: 90, padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
                    <option value="">Ano</option>
                    {[2026, 2027, 2028, 2029].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px 18px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={save} style={{ padding: '8px 18px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Metas de redução */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>Metas de Redução — {MONTHS_PT[month - 1]} {year}</h2>
        {cards.map(card => {
          const total = totals[card.id] ?? 0;
          const goal = getGoal(card.id);
          if (!goal) return null;
          const toReduce = total - goal.goal_amount;
          const pct = total > 0 ? Math.round((toReduce / total) * 100) : 0;
          return (
            <div key={card.id} style={{ marginBottom: 12, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>{card.name}</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>Prazo: {goal.target_months} meses</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 13 }}>
                <div><div style={{ color: '#94a3b8' }}>Atual</div><div style={{ fontWeight: 600, color: '#374151' }}>{formatCurrency(total)}</div></div>
                <div><div style={{ color: '#94a3b8' }}>Meta</div><div style={{ fontWeight: 600, color: '#22c55e' }}>{formatCurrency(goal.goal_amount)}</div></div>
                <div><div style={{ color: '#94a3b8' }}>Reduzir</div><div style={{ fontWeight: 600, color: toReduce > 0 ? '#ef4444' : '#22c55e' }}>{formatCurrency(Math.max(0, toReduce))}</div></div>
                <div><div style={{ color: '#94a3b8' }}>% Redução</div><div style={{ fontWeight: 600, color: pct > 0 ? '#ef4444' : '#22c55e' }}>{pct > 0 ? pct : 0}%</div></div>
              </div>
            </div>
          );
        })}
        {cards.every(c => !getGoal(c.id)) && (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Defina metas nos cartões acima para ver o plano de redução.</p>
        )}
      </div>
    </div>
  );
}
