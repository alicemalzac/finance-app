import { useState, useEffect } from 'react';
import api from './api';

export function useCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/expenses/categories/all').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  return categories;
}
