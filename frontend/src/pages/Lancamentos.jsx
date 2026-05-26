import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { formatCurrency, MONTHS_PT } from '../utils/format';
import MonthSelector from '../components/MonthSelector';
import { useLatestMonth } from '../utils/useLatestMonth';

const CATEGORIES = ['Mercado','Streamings','Beleza','Farmácia','Gasolina','Pet','Estacionamento','Restaurantes',
  'Compras','Consulta Médica','Uber','Ifood','Atividade Física','Vestuário','Suplementos','Viagem',
  'Educação/Profissional','Presentes','Taxas','Extra','????'];

const PAYMENT_TYPES = ['avista', 'parcelado', 'recorrente'];

const emptyForm = { card_id: '', store: '', amount: '', installment_current: 1, installment_total: 1, category: '', subcategory: '', payment_type: 'avista', end_month: '' };

export default function Lancamentos() {
  const { year, setYear, month, setMonth } = useLatestMonth();
  const [monthId, setMonthId] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    if (!year || !month) return;
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([api.get(`/months/${year}/${month}`), api.get('/cards/')]);
      setMonthId(mRes.data.id);
      setCards(cRes.data);
      const params = selectedCard !== 'all' ? `?card_id=${selectedCard}` : '';
      const tRes = await api.get(`/cards/transactions/${mRes.data.id}${params}`);
      setTransactions(tRes.data);
    } catch { setTransactions([]); }
    setLoading(false);
  }, [year, month, selectedCard]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (tx) => {
    setForm({ card_id: tx.card_id, store: tx.store, amount: tx.amount, installment_current: tx.installment_current,
      installment_total: tx.installment_total, category: tx.category || '', subcategory: tx.subcategory || '',
      payment_type: tx.payment_type, end_month: tx.end_month || '' });
    setEditId(tx.id); setShowForm(true);
  };

  const save = async () => {
    if (!form.card_id || !form.store || !form.amount) return;
    if (editId) await api.put(`/cards/transactions/${editId}`, form);
    else await api.post(`/cards/transactions/${monthId}`, form);
    setShowForm(false); load();
  };

  const del = async (id) => { if (!confirm('Remover?')) return; await api.delete(`/cards/transactions/${id}`); load(); };

  const filtered = transactions.filter(t => !filter || t.store.toLowerCase().includes(filter.toLowerCase()) || (t.category || '').toLowerCase().includes(filter.toLowerCase()));
  const total = filtered.reduce((s, t) => s + t.amount, 0);

  const paymentLabel = { avista: 'À vista', parcelado: 'Parcelado', recorrente: 'Recorrente' };
  const paymentColor = { avista: '#64748b', parcelado: '#f59e0b', recorrente: '#3b82f6' };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#1e293b' }}>Lançamentos dos Cartões</h1>
        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      {/* Filtros e ações */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={selectedCard} onChange={e => setSelectedCard(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, background: '#fff' }}>
          <option value="all">Todos os cartões</option>
          {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar..."
          style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, flex: 1 }} />
        <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>
          Total: <span style={{ color: '#ef4444' }}>{formatCurrency(total)}</span>
        </div>
        <button onClick={openAdd} style={{ padding: '7px 16px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          + Novo Lançamento
        </button>
      </div>

      {/* Modal de formulário */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, color: '#1e293b' }}>{editId ? 'Editar' : 'Novo'} Lançamento</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Cartão', 'card_id', 'select-card'],
                ['Estabelecimento', 'store', 'text'],
                ['Valor (R$)', 'amount', 'number'],
                ['Forma', 'payment_type', 'select-payment'],
                ['Parcela Atual', 'installment_current', 'number'],
                ['Total Parcelas', 'installment_total', 'number'],
                ['Categoria', 'category', 'select-category'],
                ['Subcategoria', 'subcategory', 'text'],
                ['Encerra em', 'end_month', 'text'],
              ].map(([label, field, type]) => (
                <div key={field} style={field === 'store' || field === 'subcategory' ? { gridColumn: '1/-1' } : {}}>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</label>
                  {type === 'select-card'
                    ? <select value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
                        <option value="">Selecione</option>
                        {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    : type === 'select-payment'
                    ? <select value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
                        {PAYMENT_TYPES.map(t => <option key={t} value={t}>{paymentLabel[t]}</option>)}
                      </select>
                    : type === 'select-category'
                    ? <select value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
                        <option value="">Sem categoria</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    : <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
                  }
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px 18px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={save} style={{ padding: '8px 18px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Cartão','Estabelecimento','Valor','Forma','Parcela','Categoria','Encerra',''].map(h => (
                <th key={h} style={{ padding: '11px 12px', textAlign: h === 'Valor' ? 'right' : 'left', color: '#374151', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Nenhum lançamento encontrado</td></tr>
            )}
            {filtered.map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '9px 12px', color: '#374151', fontWeight: 500 }}>{tx.card_name}</td>
                <td style={{ padding: '9px 12px', color: '#374151' }}>{tx.store}</td>
                <td style={{ padding: '9px 12px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>{formatCurrency(tx.amount)}</td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 10, background: `${paymentColor[tx.payment_type]}20`, color: paymentColor[tx.payment_type], fontSize: 11, fontWeight: 600 }}>
                    {paymentLabel[tx.payment_type]}
                  </span>
                </td>
                <td style={{ padding: '9px 12px', color: '#64748b' }}>
                  {tx.payment_type === 'parcelado' ? `${tx.installment_current}/${tx.installment_total}` : '—'}
                </td>
                <td style={{ padding: '9px 12px', color: '#64748b' }}>{tx.category || '—'}</td>
                <td style={{ padding: '9px 12px', color: '#64748b', fontSize: 12 }}>{tx.end_month || '—'}</td>
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
