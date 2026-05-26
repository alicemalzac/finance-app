import { MONTHS_PT } from '../utils/format';

export default function MonthSelector({ year, month, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
      <select value={month} onChange={e => onChange(year, Number(e.target.value))}
        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}>
        {MONTHS_PT.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
      </select>
      <select value={year} onChange={e => onChange(Number(e.target.value), month)}
        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}>
        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}
