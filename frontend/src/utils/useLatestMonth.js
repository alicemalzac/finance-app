import { useState, useEffect } from 'react';
import api from './api';

// Retorna o ano/mês mais recente disponível no banco
export function useLatestMonth() {
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);

  useEffect(() => {
    api.get('/months').then(res => {
      if (res.data.length > 0) {
        const now = new Date();
        const current = res.data.find(m => m.year === now.getFullYear() && m.month === now.getMonth() + 1);
        const fallback = res.data[res.data.length - 1];
        const pick = current || fallback;
        setYear(pick.year);
        setMonth(pick.month);
      }
    }).catch(() => {
      const now = new Date();
      setYear(now.getFullYear());
      setMonth(now.getMonth() + 1);
    });
  }, []);

  return { year, setYear, month, setMonth };
}
