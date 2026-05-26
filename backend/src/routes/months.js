const express = require('express');
const db = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Lista todos os meses disponíveis
router.get('/', (req, res) => {
  const months = db.prepare('SELECT * FROM months ORDER BY year, month').all();
  res.json(months);
});

// Detalhe de um mês com saldo calculado
router.get('/:year/:month', (req, res) => {
  const { year, month } = req.params;
  const monthData = db.prepare('SELECT * FROM months WHERE year = ? AND month = ?').get(year, month);
  if (!monthData) return res.status(404).json({ error: 'Mês não encontrado' });

  const fixed = db.prepare('SELECT * FROM fixed_expenses WHERE month_id = ? ORDER BY category').all(monthData.id);
  const totalFixed = fixed.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthData.salary + monthData.extra + monthData.philippe + monthData.previous_balance;
  const balance = totalIncome - totalFixed;

  res.json({ ...monthData, fixed_expenses: fixed, total_fixed: totalFixed, total_income: totalIncome, balance });
});

// Cria ou atualiza cabeçalho do mês (salário, extra, etc.)
router.put('/:year/:month', (req, res) => {
  const { year, month } = req.params;
  const { salary, extra, philippe, previous_balance } = req.body;

  const existing = db.prepare('SELECT id FROM months WHERE year = ? AND month = ?').get(year, month);
  if (existing) {
    db.prepare('UPDATE months SET salary=?, extra=?, philippe=?, previous_balance=? WHERE id=?')
      .run(salary ?? 0, extra ?? 0, philippe ?? 0, previous_balance ?? 0, existing.id);
    res.json({ id: existing.id, year, month, salary, extra, philippe, previous_balance });
  } else {
    const result = db.prepare('INSERT INTO months (year, month, salary, extra, philippe, previous_balance) VALUES (?,?,?,?,?,?)')
      .run(year, month, salary ?? 0, extra ?? 0, philippe ?? 0, previous_balance ?? 0);
    res.status(201).json({ id: result.lastInsertRowid, year, month, salary, extra, philippe, previous_balance });
  }
});

// Lista histórico anual de contas fixas
router.get('/:year/history/fixed', (req, res) => {
  const { year } = req.params;
  const months = db.prepare('SELECT * FROM months WHERE year = ? ORDER BY month').all(year);
  const result = months.map(m => {
    const fixed = db.prepare('SELECT * FROM fixed_expenses WHERE month_id = ?').all(m.id);
    return { ...m, fixed_expenses: fixed };
  });
  res.json(result);
});

module.exports = router;
