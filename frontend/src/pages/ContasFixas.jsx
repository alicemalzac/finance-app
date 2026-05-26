import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { formatCurrency, MONTHS_PT } from '../utils/format';

export default function ContasFixas() {
  const [year] = useState(2025);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
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

  // Coleta todas as categorias únicas
  const allCategories = [...new Set(months.flatMap(m => (m.fixed_expenses || []).map(e => e.category)))];

  const getAmount = (m, cat) => m.fixed_expenses?.find(e => e.category === cat)?.amount ?? null;

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Carregando...</div>;

  return (
    <div>
      <h1 style={{ margin: '0 0 20px', fontSize: 22, color: '#1e293b' }}>Histórico Anual — Contas Fixas {year}</h1>

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
            {/* Linha de totais mensais */}
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
    </div>
  );
}
