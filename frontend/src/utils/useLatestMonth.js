import { useState, useEffect } from 'react';
import api from './api';

// Retorna o ano/mês mais recente disponível no banco
export function useLatestMonth() {
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);

  useEffect(() => {
    api.get('/months').then(res => {
      if (res.data.length > 0) {
        const latest = res.data[res.data.length - 1];
        setYear(latest.year);
        setMonth(latest.month);
      }
    }).catch(() => {
      setYear(2025);
      setMonth(5);
    });
  }, []);

  return { year, setYear, month, setMonth };
}
