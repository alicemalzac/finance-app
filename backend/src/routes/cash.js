const express = require('express');
const db = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/:monthId', (req, res) => {
  const txs = db.prepare('SELECT * FROM cash_transactions WHERE month_id = ? ORDER BY day, id').all(req.params.monthId);
  res.json(txs);
});

router.post('/:monthId', (req, res) => {
  const { monthId } = req.params;
  const { day, description, amount, category, subcategory } = req.body;
  if (!description || amount == null) return res.status(400).json({ error: 'description e amount são obrigatórios' });
  const result = db.prepare('INSERT INTO cash_transactions (month_id, day, description, amount, category, subcategory) VALUES (?,?,?,?,?,?)').run(monthId, day ?? 1, description, amount, category, subcategory);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { day, description, amount, category, subcategory } = req.body;
  db.prepare('UPDATE cash_transactions SET day=?, description=?, amount=?, category=?, subcategory=? WHERE id=?').run(day, description, amount, category, subcategory, id);
  res.json({ id });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM cash_transactions WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
