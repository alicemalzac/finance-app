const db = require('./schema');

function seedAllMonths() {
  // Atualiza cabeçalho de renda por mês (extra, philippe, saldo anterior real da planilha)
  const incomeData = [
    { month: 1,  salary: 17169, extra: 0,       philippe: 0,   previous_balance: 0 },
    { month: 2,  salary: 17169, extra: 0,       philippe: 0,   previous_balance: 0 },
    { month: 3,  salary: 17169, extra: 0,       philippe: 0,   previous_balance: 0 },
    { month: 4,  salary: 17169, extra: 0,       philippe: 0,   previous_balance: 0 },
    { month: 5,  salary: 17169, extra: 1226.33, philippe: 0,   previous_balance: -2895 },
    { month: 6,  salary: 17169, extra: 0,       philippe: 827, previous_balance: -2750 },
    { month: 7,  salary: 17169, extra: 0,       philippe: 72,  previous_balance: -1446.14 },
    { month: 8,  salary: 17169, extra: 0,       philippe: 72,  previous_balance: 2511.21 },
    { month: 9,  salary: 17169, extra: 0,       philippe: 72,  previous_balance: 7073.55 },
    { month: 10, salary: 17169, extra: 0,       philippe: 72,  previous_balance: 12593.10 },
    { month: 11, salary: 17169, extra: 0,       philippe: 0,   previous_balance: 18082.50 },
    { month: 12, salary: 17169, extra: 0,       philippe: 0,   previous_balance: 23763.58 },
  ];

  // Contas fixas reais por mês (extraídas da planilha)
  const fixedByMonth = {
    1: [
      { category: 'Aluguel',             amount: 3349.00 },
      { category: 'Contador',            amount: 524.00 },
      { category: 'Imposto CNPJ',        amount: 1300.00 },
      { category: 'Claro',               amount: 155.72 },
      { category: 'Enel',                amount: 177.13 },
      { category: 'Terapia',             amount: 540.00 },
      { category: 'Picpay',              amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Saldo Negativo',      amount: 1700.77 },
      { category: 'Cartão Renner',       amount: 195.30 },
      { category: 'Stark',               amount: 162.00 },
    ],
    2: [
      { category: 'Aluguel',             amount: 3406.59 },
      { category: 'Contador',            amount: 586.60 },
      { category: 'Imposto CNPJ',        amount: 1169.00 },
      { category: 'Claro',               amount: 302.81 },
      { category: 'Enel',                amount: 185.26 },
      { category: 'Terapia',             amount: 800.00 },
      { category: 'Picpay',              amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Saldo Negativo',      amount: 1893.99 },
      { category: 'Cartão Bradesco',     amount: 4508.45 },
      { category: 'Cartão Santander',    amount: 2081.11 },
      { category: 'IPVA',                amount: 267.51 },
      { category: 'Mãe',                 amount: 500.00 },
      { category: 'Cartão Renner',       amount: 257.56 },
      { category: 'Stark',               amount: 162.00 },
    ],
    3: [
      { category: 'Aluguel',             amount: 3344.00 },
      { category: 'Contador',            amount: 586.60 },
      { category: 'Imposto CNPJ',        amount: 993.33 },
      { category: 'Claro',               amount: 402.95 },
      { category: 'Enel',                amount: 183.00 },
      { category: 'Terapia',             amount: 600.00 },
      { category: 'Picpay',              amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Saldo Negativo',      amount: 1800.00 },
      { category: 'Cartão Bradesco',     amount: 4734.02 },
      { category: 'Cartão Santander',    amount: 2107.27 },
      { category: 'IPVA',                amount: 267.51 },
      { category: 'Pai',                 amount: 1000.00 },
      { category: 'Stark',               amount: 162.00 },
    ],
    4: [
      { category: 'Aluguel',             amount: 3469.10 },
      { category: 'Contador',            amount: 586.60 },
      { category: 'Claro',               amount: 299.89 },
      { category: 'Enel',                amount: 198.85 },
      { category: 'Terapia',             amount: 1000.00 },
      { category: 'Picpay',              amount: 476.09 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Saldo Negativo',      amount: 1270.24 },
      { category: 'Cartão Bradesco',     amount: 4722.34 },
      { category: 'Cartão Santander',    amount: 2064.73 },
      { category: 'IPVA',                amount: 267.51 },
      { category: 'Mãe',                 amount: 633.00 },
      { category: 'Ingresso HS',         amount: 172.35 },
      { category: 'Pai',                 amount: 800.00 },
      { category: 'Stark',               amount: 162.00 },
    ],
    5: [
      { category: 'Aluguel',             amount: 3658.27 },
      { category: 'Contador',            amount: 766.30 },
      { category: 'Claro',               amount: 365.84 },
      { category: 'Brisanet',            amount: 100.00 },
      { category: 'Enel',                amount: 222.59 },
      { category: 'Terapia',             amount: 600.00 },
      { category: 'Imposto CNPJ',        amount: 1140.14 },
      { category: 'Picpay',              amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Cartão Bradesco',     amount: 3399.48 },
      { category: 'Mãe',                 amount: 833.33 },
      { category: 'Pai',                 amount: 1000.00 },
      { category: 'Ingresso HS',         amount: 172.35 },
      { category: 'Mercado Pago',        amount: 155.21 },
    ],
    6: [
      { category: 'Aluguel',             amount: 3393.61 },
      { category: 'Contador',            amount: 586.30 },
      { category: 'Imposto CNPJ',        amount: 1140.14 },
      { category: 'Claro',               amount: 329.90 },
      { category: 'Brisanet',            amount: 109.80 },
      { category: 'Enel',                amount: 260.50 },
      { category: 'Terapia',             amount: 600.00 },
      { category: 'Unimed',              amount: 800.00 },
      { category: 'Picpay',              amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Cartão Bradesco',     amount: 4108.30 },
      { category: 'Cartão Santander',    amount: 1106.37 },
      { category: 'IPVA',                amount: 535.02 },
      { category: 'Mãe',                 amount: 536.33 },
      { category: 'Pai',                 amount: 1000.00 },
      { category: 'Ingresso HS',         amount: 172.35 },
      { category: 'Mercado Pago',        amount: 155.21 },
      { category: 'Luiz',                amount: 110.00 },
    ],
    7: [
      { category: 'Aluguel',             amount: 3393.61 },
      { category: 'Contador',            amount: 586.30 },
      { category: 'Imposto CNPJ',        amount: 1400.00 },
      { category: 'Claro',               amount: 90.00 },
      { category: 'Brisanet',            amount: 109.80 },
      { category: 'Enel',                amount: 230.00 },
      { category: 'Terapia',             amount: 800.00 },
      { category: 'Unimed',              amount: 800.00 },
      { category: 'Picpay',              amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Cartão Bradesco',     amount: 2267.16 },
      { category: 'Cartão Santander',    amount: 998.01 },
      { category: 'Mãe',                 amount: 203.00 },
      { category: 'Ingresso HS',         amount: 172.35 },
      { category: 'Mercado Pago',        amount: 155.21 },
    ],
    8: [
      { category: 'Aluguel',             amount: 3393.61 },
      { category: 'Contador',            amount: 586.30 },
      { category: 'Imposto CNPJ',        amount: 1400.00 },
      { category: 'Claro',               amount: 90.00 },
      { category: 'Brisanet',            amount: 109.80 },
      { category: 'Enel',                amount: 230.00 },
      { category: 'Terapia',             amount: 800.00 },
      { category: 'Unimed',              amount: 800.00 },
      { category: 'Picpay',              amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Cartão Bradesco',     amount: 2000.00 },
      { category: 'Cartão Santander',    amount: 931.53 },
      { category: 'Mãe',                 amount: 104.00 },
      { category: 'Mercado Pago',        amount: 155.21 },
    ],
    9: [
      { category: 'Aluguel',             amount: 3393.61 },
      { category: 'Contador',            amount: 586.30 },
      { category: 'Imposto CNPJ',        amount: 1400.00 },
      { category: 'Claro',               amount: 90.00 },
      { category: 'Brisanet',            amount: 109.80 },
      { category: 'Enel',                amount: 230.00 },
      { category: 'Unimed',              amount: 800.00 },
      { category: 'Picpay',              amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Cartão Bradesco',     amount: 2000.00 },
      { category: 'Cartão Santander',    amount: 931.53 },
      { category: 'Mãe',                 amount: 102.00 },
    ],
    10: [
      { category: 'Aluguel',             amount: 3393.61 },
      { category: 'Contador',            amount: 586.30 },
      { category: 'Imposto CNPJ',        amount: 1400.00 },
      { category: 'Claro',               amount: 90.00 },
      { category: 'Brisanet',            amount: 109.80 },
      { category: 'Enel',                amount: 230.00 },
      { category: 'Terapia',             amount: 1000.00 },
      { category: 'Unimed',              amount: 800.00 },
      { category: 'Picpay',              amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Cartão Bradesco',     amount: 2000.00 },
      { category: 'Cartão Santander',    amount: 63.68 },
    ],
    11: [
      { category: 'Aluguel',             amount: 3393.61 },
      { category: 'Contador',            amount: 586.30 },
      { category: 'Imposto CNPJ',        amount: 1400.00 },
      { category: 'Claro',               amount: 90.00 },
      { category: 'Brisanet',            amount: 109.80 },
      { category: 'Enel',                amount: 230.00 },
      { category: 'Terapia',             amount: 800.00 },
      { category: 'Unimed',              amount: 800.00 },
      { category: 'Picpay',              amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Cartão Bradesco',     amount: 2000.00 },
    ],
    12: [
      { category: 'Aluguel',             amount: 3393.61 },
      { category: 'Contador',            amount: 586.30 },
      { category: 'Imposto CNPJ',        amount: 1400.00 },
      { category: 'Claro',               amount: 90.00 },
      { category: 'Brisanet',            amount: 109.80 },
      { category: 'Enel',                amount: 230.00 },
      { category: 'Terapia',             amount: 800.00 },
      { category: 'Unimed',              amount: 800.00 },
      { category: 'Picpay',              amount: 478.88 },
      { category: 'Financiamento Carro', amount: 1599.33 },
      { category: 'Cartão Bradesco',     amount: 2000.00 },
    ],
  };

  // Atualiza renda de cada mês
  const updateMonth = db.prepare(
    'UPDATE months SET salary=?, extra=?, philippe=?, previous_balance=? WHERE year=2026 AND month=?'
  );
  for (const inc of incomeData) {
    updateMonth.run(inc.salary, inc.extra, inc.philippe, inc.previous_balance, inc.month);
  }

  // Substitui contas fixas mês a mês
  const deleteFixed  = db.prepare('DELETE FROM fixed_expenses WHERE month_id=?');
  const insertFixed  = db.prepare('INSERT INTO fixed_expenses (month_id, category, amount) VALUES (?,?,?)');
  const getMonthId   = db.prepare('SELECT id FROM months WHERE year=2026 AND month=?');

  for (const [monthNum, expenses] of Object.entries(fixedByMonth)) {
    const row = getMonthId.get(Number(monthNum));
    if (!row) { console.warn(`Mês ${monthNum} não encontrado`); continue; }
    deleteFixed.run(row.id);
    for (const exp of expenses) {
      insertFixed.run(row.id, exp.category, exp.amount);
    }
    console.log(`  Mês ${monthNum.padStart(2,'0')}/2026: ${expenses.length} contas inseridas`);
  }

  console.log('\nTodos os 12 meses populados com dados reais da planilha!');
}

seedAllMonths();
