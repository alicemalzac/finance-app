const express = require('express');
const db = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Contas fixas de um mês
router.get('/:monthId', (req, res) => {
  const { monthId } = req.params;
  const expenses = db.prepare('SELECT * FROM fixed_expenses WHERE month_id = ? ORDER BY category').all(monthId);
  res.json(expenses);
});

router.post('/:monthId', (req, res) => {
  const { monthId } = req.params;
  const { category, amount } = req.body;
  if (!category) return res.status(400).json({ error: 'Categoria obrigatória' });
  const result = db.prepare('INSERT INTO fixed_expenses (month_id, category, amount) VALUES (?, ?, ?)').run(monthId, category, amount ?? 0);
  res.status(201).json({ id: result.lastInsertRowid, month_id: monthId, category, amount: amount ?? 0 });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { category, amount } = req.body;
  db.prepare('UPDATE fixed_expenses SET category=?, amount=? WHERE id=?').run(category, amount, id);
  res.json({ id, category, amount });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM fixed_expenses WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Categorias de gastos variáveis
router.get('/categories/all', (req, res) => {
  const cats = db.prepare('SELECT * FROM expense_categories ORDER BY sort_order').all();
  res.json(cats);
});

router.post('/categories', (req, res) => {
  const { name, monthly_goal } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM expense_categories').get();
  const sortOrder = (maxOrder.m ?? 0) + 1;
  const result = db.prepare('INSERT INTO expense_categories (name, monthly_goal, sort_order) VALUES (?,?,?)').run(name, monthly_goal ?? 0, sortOrder);
  res.status(201).json({ id: result.lastInsertRowid, name, monthly_goal: monthly_goal ?? 0, sort_order: sortOrder });
});

router.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, monthly_goal } = req.body;
  db.prepare('UPDATE expense_categories SET name=?, monthly_goal=? WHERE id=?').run(name, monthly_goal, id);
  res.json({ id, name, monthly_goal });
});

// Gastos por categoria em um mês
router.get('/category-spending/:monthId', (req, res) => {
  const { monthId } = req.params;
  const spending = db.prepare(`
    SELECT cs.*, ec.name, ec.monthly_goal, ec.sort_order
    FROM category_spending cs
    JOIN expense_categories ec ON cs.category_id = ec.id
    WHERE cs.month_id = ?
    ORDER BY ec.sort_order
  `).all(monthId);

  const allCats = db.prepare('SELECT * FROM expense_categories ORDER BY sort_order').all();
  const result = allCats.map(cat => {
    const spent = spending.find(s => s.category_id === cat.id);
    return { ...cat, amount: spent?.amount ?? 0, spending_id: spent?.id ?? null };
  });
  res.json(result);
});

router.put('/category-spending/:monthId/:categoryId', (req, res) => {
  const { monthId, categoryId } = req.params;
  const { amount } = req.body;
  const existing = db.prepare('SELECT id FROM category_spending WHERE month_id=? AND category_id=?').get(monthId, categoryId);
  if (existing) {
    db.prepare('UPDATE category_spending SET amount=? WHERE id=?').run(amount, existing.id);
    res.json({ id: existing.id, month_id: monthId, category_id: categoryId, amount });
  } else {
    const result = db.prepare('INSERT INTO category_spending (month_id, category_id, amount) VALUES (?,?,?)').run(monthId, categoryId, amount);
    res.status(201).json({ id: result.lastInsertRowid, month_id: monthId, category_id: categoryId, amount });
  }
});

module.exports = router;
