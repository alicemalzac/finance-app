const db = require('./schema');
const bcrypt = require('bcryptjs');

function seed() {
  // User padrão
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('alicelinsc.malzac@gmail.com');
  if (!existingUser) {
    const hash = bcrypt.hashSync('finance2025', 10);
    db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run('Alice', 'alicelinsc.malzac@gmail.com', hash);
  }

  // Cartões de crédito
  ['Bradesco', 'Santander', 'Renner'].forEach(name => {
    db.prepare('INSERT OR IGNORE INTO credit_cards (name) VALUES (?)').run(name);
  });

  // Categorias de gastos com metas
  const categories = [
    { name: 'Mercado', goal: 500, order: 1 },
    { name: 'Mercadinho do Prédio', goal: 50, order: 2 },
    { name: 'Streamings', goal: 200, order: 3 },
    { name: 'Beleza', goal: 300, order: 4 },
    { name: 'Farmácia', goal: 600, order: 5 },
    { name: 'Gasolina', goal: 500, order: 6 },
    { name: 'Pet', goal: 350, order: 7 },
    { name: 'Estacionamento', goal: 50, order: 8 },
    { name: 'Restaurantes', goal: 300, order: 9 },
    { name: 'Compras', goal: 400, order: 10 },
    { name: 'Consulta Médica', goal: 0, order: 11 },
    { name: 'Uber', goal: 100, order: 12 },
    { name: 'Ifood', goal: 0, order: 13 },
    { name: 'Atividade Física', goal: 200, order: 14 },
    { name: 'Vestuário', goal: 200, order: 15 },
    { name: 'Suplementos', goal: 200, order: 16 },
    { name: 'Viagem', goal: 700, order: 17 },
    { name: 'Educação/Profissional', goal: 0, order: 18 },
    { name: 'Presentes', goal: 250, order: 19 },
    { name: 'Taxas', goal: 0, order: 20 },
    { name: 'Extra', goal: 100, order: 21 },
    { name: '????', goal: 0, order: 22 },
  ];
  categories.forEach(c => {
    db.prepare('INSERT OR IGNORE INTO expense_categories (name, monthly_goal, sort_order) VALUES (?, ?, ?)').run(c.name, c.goal, c.order);
  });

  // Meses de 2025 (Janeiro a Dezembro)
  const monthsData = [
    { month: 1, salary: 17169, extra: 0, philippe: 0, previous_balance: 0 },
    { month: 2, salary: 17169, extra: 0, philippe: 0, previous_balance: 0 },
    { month: 3, salary: 17169, extra: 0, philippe: 0, previous_balance: 0 },
    { month: 4, salary: 17169, extra: 0, philippe: 0, previous_balance: 0 },
    { month: 5, salary: 17169, extra: 0, philippe: 0, previous_balance: -2895 },
    { month: 6, salary: 17169, extra: 0, philippe: 0, previous_balance: 0 },
    { month: 7, salary: 17169, extra: 0, philippe: 0, previous_balance: 0 },
    { month: 8, salary: 17169, extra: 0, philippe: 0, previous_balance: 0 },
    { month: 9, salary: 17169, extra: 0, philippe: 0, previous_balance: 0 },
    { month: 10, salary: 17169, extra: 0, philippe: 0, previous_balance: 0 },
    { month: 11, salary: 17169, extra: 0, philippe: 0, previous_balance: 0 },
    { month: 12, salary: 17169, extra: 0, philippe: 0, previous_balance: 0 },
  ];

  const insertMonth = db.prepare('INSERT OR IGNORE INTO months (year, month, salary, extra, philippe, previous_balance) VALUES (?, ?, ?, ?, ?, ?)');
  monthsData.forEach(m => {
    insertMonth.run(2025, m.month, m.salary, m.extra, m.philippe, m.previous_balance);
  });

  // Contas fixas de Maio (exemplo com dados reais)
  const mayId = db.prepare('SELECT id FROM months WHERE year = 2025 AND month = 5').get()?.id;
  if (mayId) {
    const fixedExpenses = [
      { category: 'Aluguel', amount: 3393.61 },
      { category: 'Contador', amount: 586.30 },
      { category: 'Claro', amount: 90.00 },
      { category: 'Brisanet', amount: 109.80 },
      { category: 'Enel', amount: 230.00 },
      { category: 'Terapia', amount: 800.00 },
      { category: 'Unimed', amount: 800.00 },
      { category: 'Cartão Bradesco', amount: 3399.48 },
      { category: 'Cartão Santander', amount: 2169.45 },
      { category: 'Imposto CNPJ', amount: 1400.00 },
      { category: 'Picpay', amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Mãe', amount: 500.00 },
      { category: 'Ingresso HS', amount: 172.35 },
      { category: 'Mercado Pago', amount: 155.21 },
    ];
    const existing = db.prepare('SELECT id FROM fixed_expenses WHERE month_id = ?').get(mayId);
    if (!existing) {
      const insertFixed = db.prepare('INSERT INTO fixed_expenses (month_id, category, amount) VALUES (?, ?, ?)');
      fixedExpenses.forEach(e => insertFixed.run(mayId, e.category, e.amount));
    }
  }

  console.log('Seed concluído!');
}

seed();
