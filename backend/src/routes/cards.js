const express = require('express');
const db = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Lista todos os cartões
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM credit_cards').all());
});

// Metas do cartão por mês
router.get('/goals/:monthId', (req, res) => {
  const { monthId } = req.params;
  const goals = db.prepare(`
    SELECT cg.*, cc.name AS card_name
    FROM card_goals cg
    JOIN credit_cards cc ON cg.card_id = cc.id
    WHERE cg.month_id = ?
  `).all(monthId);
  res.json(goals);
});

router.put('/goals/:monthId/:cardId', (req, res) => {
  const { monthId, cardId } = req.params;
  const { goal_amount, target_months } = req.body;
  const existing = db.prepare('SELECT id FROM card_goals WHERE month_id=? AND card_id=?').get(monthId, cardId);
  if (existing) {
    db.prepare('UPDATE card_goals SET goal_amount=?, target_months=? WHERE id=?').run(goal_amount, target_months ?? 3, existing.id);
    res.json({ id: existing.id });
  } else {
    const result = db.prepare('INSERT INTO card_goals (card_id, month_id, goal_amount, target_months) VALUES (?,?,?,?)').run(cardId, monthId, goal_amount, target_months ?? 3);
    res.status(201).json({ id: result.lastInsertRowid });
  }
});

// Histórico de evolução dos cartões (todos os meses do ano)
router.get('/history/:year/:cardId', (req, res) => {
  const { year, cardId } = req.params;
  const months = db.prepare('SELECT * FROM months WHERE year = ? ORDER BY month').all(year);
  const result = months.map(m => {
    const transactions = db.prepare('SELECT SUM(amount) as total FROM card_transactions WHERE month_id=? AND card_id=?').get(m.id, cardId);
    const goal = db.prepare('SELECT * FROM card_goals WHERE month_id=? AND card_id=?').get(m.id, cardId);
    return { month: m.month, year: m.year, total: transactions?.total ?? 0, goal: goal?.goal_amount ?? null };
  });
  res.json(result);
});

// Transações do cartão
router.get('/transactions/:monthId', (req, res) => {
  const { monthId } = req.params;
  const { card_id } = req.query;
  let query = 'SELECT ct.*, cc.name AS card_name FROM card_transactions ct JOIN credit_cards cc ON ct.card_id = cc.id WHERE ct.month_id = ?';
  const params = [monthId];
  if (card_id) { query += ' AND ct.card_id = ?'; params.push(card_id); }
  query += ' ORDER BY ct.store';
  res.json(db.prepare(query).all(...params));
});

router.post('/transactions/:monthId', (req, res) => {
  const { monthId } = req.params;
  const { card_id, store, amount, installment_current, installment_total, category, subcategory, payment_type, end_month } = req.body;
  if (!card_id || !store || amount == null) return res.status(400).json({ error: 'card_id, store e amount são obrigatórios' });
  const result = db.prepare(`
    INSERT INTO card_transactions (card_id, month_id, store, amount, installment_current, installment_total, category, subcategory, payment_type, end_month)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(card_id, monthId, store, amount, installment_current ?? 1, installment_total ?? 1, category, subcategory, payment_type ?? 'avista', end_month);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { store, amount, installment_current, installment_total, category, subcategory, payment_type, end_month } = req.body;
  db.prepare(`
    UPDATE card_transactions SET store=?, amount=?, installment_current=?, installment_total=?, category=?, subcategory=?, payment_type=?, end_month=? WHERE id=?
  `).run(store, amount, installment_current, installment_total, category, subcategory, payment_type, end_month, id);
  res.json({ id });
});

router.delete('/transactions/:id', (req, res) => {
  db.prepare('DELETE FROM card_transactions WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
