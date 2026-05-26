// Roda localmente e popula o banco de PRODUÇÃO via API HTTP
// Usage: node seed-production.js

const BASE = 'https://finance-backend-production-5efa.up.railway.app/api';

async function post(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return res.json();
}
async function put(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return res.json();
}
async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

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

const fixedByMonth = {
  1: [['Aluguel',3349],['Contador',524],['Imposto CNPJ',1300],['Claro',155.72],['Enel',177.13],['Terapia',540],['Picpay',478.88],['Financiamento Carro',1599.33],['Saldo Negativo',1700.77],['Cartão Renner',195.30],['Stark',162]],
  2: [['Aluguel',3406.59],['Contador',586.60],['Imposto CNPJ',1169],['Claro',302.81],['Enel',185.26],['Terapia',800],['Picpay',478.88],['Financiamento Carro',1599.33],['Saldo Negativo',1893.99],['Cartão Bradesco',4508.45],['Cartão Santander',2081.11],['IPVA',267.51],['Mãe',500],['Cartão Renner',257.56],['Stark',162]],
  3: [['Aluguel',3344],['Contador',586.60],['Imposto CNPJ',993.33],['Claro',402.95],['Enel',183],['Terapia',600],['Picpay',478.88],['Financiamento Carro',1599.33],['Saldo Negativo',1800],['Cartão Bradesco',4734.02],['Cartão Santander',2107.27],['IPVA',267.51],['Pai',1000],['Stark',162]],
  4: [['Aluguel',3469.10],['Contador',586.60],['Claro',299.89],['Enel',198.85],['Terapia',1000],['Picpay',476.09],['Financiamento Carro',1599.33],['Saldo Negativo',1270.24],['Cartão Bradesco',4722.34],['Cartão Santander',2064.73],['IPVA',267.51],['Mãe',633],['Ingresso HS',172.35],['Pai',800],['Stark',162]],
  5: [['Aluguel',3658.27],['Contador',766.30],['Claro',365.84],['Brisanet',100],['Enel',222.59],['Terapia',600],['Imposto CNPJ',1140.14],['Picpay',478.88],['Financiamento Carro',1599.33],['Cartão Bradesco',3399.48],['Mãe',833.33],['Pai',1000],['Ingresso HS',172.35],['Mercado Pago',155.21]],
  6: [['Aluguel',3393.61],['Contador',586.30],['Imposto CNPJ',1140.14],['Claro',329.90],['Brisanet',109.80],['Enel',260.50],['Terapia',600],['Unimed',800],['Picpay',478.88],['Financiamento Carro',1599.33],['Cartão Bradesco',4108.30],['Cartão Santander',1106.37],['IPVA',535.02],['Mãe',536.33],['Pai',1000],['Ingresso HS',172.35],['Mercado Pago',155.21],['Luiz',110]],
  7: [['Aluguel',3393.61],['Contador',586.30],['Imposto CNPJ',1400],['Claro',90],['Brisanet',109.80],['Enel',230],['Terapia',800],['Unimed',800],['Picpay',478.88],['Financiamento Carro',1599.33],['Cartão Bradesco',2267.16],['Cartão Santander',998.01],['Mãe',203],['Ingresso HS',172.35],['Mercado Pago',155.21]],
  8: [['Aluguel',3393.61],['Contador',586.30],['Imposto CNPJ',1400],['Claro',90],['Brisanet',109.80],['Enel',230],['Terapia',800],['Unimed',800],['Picpay',478.88],['Financiamento Carro',1599.33],['Cartão Bradesco',2000],['Cartão Santander',931.53],['Mãe',104],['Mercado Pago',155.21]],
  9: [['Aluguel',3393.61],['Contador',586.30],['Imposto CNPJ',1400],['Claro',90],['Brisanet',109.80],['Enel',230],['Unimed',800],['Picpay',478.88],['Financiamento Carro',1599.33],['Cartão Bradesco',2000],['Cartão Santander',931.53],['Mãe',102]],
  10: [['Aluguel',3393.61],['Contador',586.30],['Imposto CNPJ',1400],['Claro',90],['Brisanet',109.80],['Enel',230],['Terapia',1000],['Unimed',800],['Picpay',478.88],['Financiamento Carro',1599.33],['Cartão Bradesco',2000],['Cartão Santander',63.68]],
  11: [['Aluguel',3393.61],['Contador',586.30],['Imposto CNPJ',1400],['Claro',90],['Brisanet',109.80],['Enel',230],['Terapia',800],['Unimed',800],['Picpay',478.88],['Financiamento Carro',1599.33],['Cartão Bradesco',2000]],
  12: [['Aluguel',3393.61],['Contador',586.30],['Imposto CNPJ',1400],['Claro',90],['Brisanet',109.80],['Enel',230],['Terapia',800],['Unimed',800],['Picpay',478.88],['Financiamento Carro',1599.33],['Cartão Bradesco',2000]],
};

const categories = [
  ['Mercado',500],['Mercadinho do Prédio',50],['Streamings',200],['Beleza',300],['Farmácia',600],
  ['Gasolina',500],['Pet',350],['Estacionamento',50],['Restaurantes',300],['Compras',400],
  ['Consulta Médica',0],['Uber',100],['Ifood',0],['Atividade Física',200],['Vestuário',200],
  ['Suplementos',200],['Viagem',700],['Educação/Profissional',0],['Presentes',250],['Taxas',0],
  ['Extra',100],['????',0],
];

const cardTx = [
  // FEVEREIRO - Bradesco
  ...[ ['Amazon',66.63,3,1,'Compras',null,'parcelado','Fevereiro'],['Extrafarma',95.06,3,2,'Farmácia',null,'parcelado','Março'],['Oriforig',111.99,4,2,'????',null,'parcelado','Março'],['Ticket Sports',84.19,2,1,'Atividade Física','Corrida','parcelado','Fevereiro'],['Mercado Livre',77.67,2,1,'Compras','Casa','parcelado','Fevereiro'],['Sol Norte',102.00,2,3,'Vestuário','Óculos','parcelado','Abril'],['Gympass',189.90,0,0,'Atividade Física','Academia','recorrente',null],['Petz',97.78,2,1,'Pet',null,'parcelado','Fevereiro'],['Anuidade',46.41,0,0,'Taxas',null,'recorrente',null],['Petz',102.23,0,0,'Pet',null,'avista',null],['Mercado Livre',87.99,0,0,'Compras','Casa','avista',null],['Juliana Vet',81.90,0,0,'Pet',null,'avista',null],['Mamazoo Pet',150.00,0,0,'Pet',null,'avista',null],['Renner',86.58,1,3,'Vestuário','Roupas','parcelado','Abril'],['Florena',45.10,0,0,'Alimentação',null,'avista',null],['Drogasil',119.24,1,3,'Farmácia',null,'parcelado','Abril'],['Amazon',67.93,1,10,'Presente',null,'parcelado',null],['Petz',147.19,0,0,'Pet',null,'avista',null],['Dengo',66.64,1,3,'Presente',null,'parcelado','Abril'],['Vonny',63.34,1,3,'Compras',null,'parcelado','Abril'],['Frangolandia',65.34,0,0,'Mercado',null,'avista',null],['São Luiz',88.05,0,0,'Mercado',null,'avista',null],['Max Wendell',57.90,1,3,'Beleza','Salão','parcelado','Abril'],['J L Combustível',266.12,0,0,'Gasolina',null,'avista',null],['Pague Menos',65.56,0,0,'Farmácia',null,'avista',null],['Loja Física',32.11,1,3,'Mercado',null,'parcelado','Abril'],['Animale',70.24,1,2,'Pet',null,'parcelado','Março'],['Ticket Sports',144.71,1,2,'Atividade Física','Corrida','parcelado','Março'],['Laguna',143.10,0,0,'Presente',null,'avista',null],['Petz',35.69,0,0,'Pet',null,'avista',null],['Center Box',138.75,0,0,'Mercado',null,'avista',null],['Normatel',32.87,0,0,'Compras','Casa','avista',null],['Mercado Livre',163.97,0,0,'Suplementos',null,'avista',null],['Drogasil',67.18,1,4,'Farmácia',null,'parcelado',null],['Ticket Sports',144.48,0,0,'Atividade Física','Corrida','avista',null],['Petz - Assinatura',12.90,0,0,'Pet',null,'recorrente',null] ].map(r=>({month:2,card:'Bradesco',store:r[0],amount:r[1],ic:r[2],it:r[3],cat:r[4],sub:r[5],type:r[6],end:r[7]})),
  // FEVEREIRO - Renner
  ...[ ['Amazon',138.28,5,1,'Compras','Escritório','parcelado',null],['Ifood',178.38,0,0,'Pet','Cobasi','avista',null],['Ifood',42.89,0,0,'Alimentação','Parrileiro','avista',null],['Ifood',54.80,0,0,'Alimentação','Lagostinne','avista',null],['Ifood',41.39,0,0,'Alimentação','SBS','avista',null],['Ifood',95.60,0,0,'Alimentação','Lagostinne','avista',null],['Ifood',86.70,0,0,'Alimentação','Lagostinne','avista',null],['Ifood',38.68,0,0,'Alimentação',null,'avista',null],['Ifood',63.93,2,2,'Alimentação','Vidarr','parcelado','Fevereiro'] ].map(r=>({month:2,card:'Renner',store:r[0],amount:r[1],ic:r[2],it:r[3],cat:r[4],sub:r[5],type:r[6],end:r[7]})),
  // FEVEREIRO - Santander
  ...[ ['Spotify',23.90,0,0,'Streamings',null,'recorrente',null],['Acalantis',61.91,2,2,'Presente',null,'parcelado','Março'],['Mundo Verde',42.80,2,1,'Suplementos',null,'parcelado','Fevereiro'],['Maratona do Rio',116.98,2,2,'Atividade Física',null,'parcelado','Março'],['C&A',92.51,2,3,'Vestuário',null,'parcelado','Abril'],['Shein',75.08,1,5,'Vestuário',null,'parcelado','Junho'],['Shein',124.87,0,0,'Vestuário',null,'avista',null],['Dondoka',166.25,0,0,'Beleza',null,'avista',null],['Petz',75.04,0,0,'Pet',null,'avista',null],['Google One',49.99,0,0,'Streamings',null,'recorrente',null],['Apple',66.90,0,0,'Streamings',null,'recorrente',null],['Netflix',20.90,0,0,'Streamings',null,'recorrente',null],['Hoots',101.70,0,0,'Alimentação',null,'avista',null],['Kalunga',37.73,2,2,'Compras',null,'parcelado','Fevereiro'],['Estacionamento',23.00,0,0,'Estacionamento',null,'avista',null],['Extrafarma',48.98,0,0,'Farmácia',null,'avista',null],['Mercadinho São Luiz',49.43,0,0,'Mercado',null,'avista',null],['Castanha',76.00,0,0,'Presente',null,'avista',null],['Gasolina',252.37,0,0,'Gasolina',null,'avista',null],['Nutriceara',48.50,2,3,'Suplementos',null,'parcelado',null] ].map(r=>({month:2,card:'Santander',store:r[0],amount:r[1],ic:r[2],it:r[3],cat:r[4],sub:r[5],type:r[6],end:r[7]})),
  // MARÇO - Bradesco
  ...[ ['Oriforig',111.99,5,1,'????',null,'parcelado','Março'],['Amazon',66.63,3,1,'Compras',null,'parcelado','Março'],['Extrafarma',95.06,4,1,'Farmácia',null,'parcelado','Março'],['Sol Norte',102.00,3,2,'Vestuário','Óculos','parcelado','Abril'],['Gympass',119.90,0,0,'Atividade Física','Academia','recorrente',null],['Anuidade',50.00,0,0,'Taxas',null,'recorrente',null],['Renner',86.56,2,2,'Vestuário','Roupas','parcelado','Abril'],['Drogasil',119.22,2,2,'Farmácia',null,'parcelado','Abril'],['Amazon',67.84,2,9,'Presente',null,'parcelado',null],['Dengo',66.64,2,2,'Presente',null,'parcelado','Abril'],['Vonny',63.34,2,2,'Compras',null,'parcelado','Abril'],['Max Wendell',57.90,2,2,'Beleza','Salão','parcelado','Abril'],['Loja Física',32.11,2,2,'Compras',null,'parcelado','Abril'],['Animale',70.23,2,1,'Pet',null,'parcelado','Março'],['Ticket Sports',144.71,2,1,'Atividade Física','Corrida','parcelado','Março'],['Petz - Assinatura',12.90,0,0,'Pet',null,'recorrente',null],['Drogasil',153.65,2,2,'Farmácia',null,'parcelado','Abril'],['Mercado Livre',28.54,2,2,'Suplementos',null,'parcelado','Abril'],['Zona Azul',2.85,0,0,'Estacionamento',null,'avista',null],['Gol',106.04,1,5,'Viagem',null,'parcelado','Junho'],['Pague Menos',41.45,0,0,'Farmácia',null,'avista',null],['FLOZO',86.00,0,0,'Beleza',null,'avista',null],['Supermercado Pinheiro',99.45,1,3,'Mercado',null,'parcelado','Maio'],['TAM',174.46,1,4,'Viagem',null,'parcelado','Junho'],['UBER',36.24,0,0,'Uber',null,'avista',null],['Shopee',73.62,0,0,'Compras',null,'avista',null],['UBER',27.43,0,0,'Uber',null,'avista',null],['Drogasil',124.41,0,0,'Farmácia',null,'avista',null],['Shopee',60.28,0,0,'Compras',null,'avista',null],['Mercadinho São Luiz',114.77,0,0,'Mercado',null,'avista',null],['Ta Limpo',64.40,0,0,'Mercado',null,'avista',null],['Cell Express',100.00,1,2,'Compras',null,'parcelado','Abril'],['Extra Farma',66.34,1,4,'Farmácia',null,'parcelado','Abril'],['Tecnoagil',114.50,1,2,'Compras',null,'parcelado','Abril'],['Petz Digital',80.09,1,2,'Pet',null,'parcelado','Abril'],['AKI Asian',105.00,0,0,'Alimentação',null,'avista',null],['Josianne Nunes',250.00,0,0,'Beleza',null,'avista',null],['Posto',29.25,0,0,'Gasolina',null,'avista',null],['Farmácia',47.52,1,4,'Farmácia',null,'parcelado','Junho'],['Mercado Livre',137.18,1,2,'Suplementos',null,'parcelado','Abril'],['Mercado Livre',22.14,1,3,'Suplementos',null,'parcelado','Maio'],['Amazon',14.01,1,6,'Compras',null,'parcelado',null],['Mercado Livre',86.34,1,3,'Suplementos',null,'parcelado','Maio'],['Amazon',60.17,1,2,'Compras',null,'parcelado','Abril'],['Ifood',62.79,0,0,'Ifood',null,'avista',null],['Uber',70.15,0,0,'Uber',null,'avista',null],['Drogasil',72.55,0,0,'Farmácia',null,'avista',null] ].map(r=>({month:3,card:'Bradesco',store:r[0],amount:r[1],ic:r[2],it:r[3],cat:r[4],sub:r[5],type:r[6],end:r[7]})),
  // MARÇO - Santander
  ...[ ['Spotify',47.80,0,0,'Streamings',null,'recorrente',null],['Acalantis',61.91,3,1,'Presente',null,'parcelado','Março'],['Maratona do Rio',116.98,3,1,'Atividade Física',null,'parcelado','Março'],['C&A',92.51,3,2,'Vestuário',null,'parcelado','Abril'],['Shein',75.08,2,4,'Vestuário',null,'parcelado','Junho'],['Google One',24.19,0,0,'Streamings',null,'recorrente',null],['Apple',133.80,0,0,'Streamings',null,'recorrente',null],['Netflix',20.90,0,0,'Streamings',null,'recorrente',null],['Padoca Les Roches',126.62,0,0,'Alimentação',null,'avista',null],['Drogasil',53.15,1,3,'Farmácia',null,'parcelado','Maio'],['JIM',220.00,0,0,'Beleza',null,'avista',null],['Dondokas',210.00,0,0,'Beleza',null,'avista',null],['Mercadinho São Luiz',108.31,1,2,'Mercado',null,'parcelado','Abril'],['Spettim',81.50,0,0,'Alimentação',null,'avista',null],['Patricia',110.00,0,0,'Beleza',null,'avista',null],['Kalunga',37.73,3,2,'Compras',null,'parcelado','Março'],['Nutriceara',48.50,3,2,'Suplementos',null,'parcelado','Abril'] ].map(r=>({month:3,card:'Santander',store:r[0],amount:r[1],ic:r[2],it:r[3],cat:r[4],sub:r[5],type:r[6],end:r[7]})),
  // ABRIL - Bradesco
  ...[ ['Amazon',67.84,3,8,'Presente',null,'parcelado','Outubro'],['Sol Norte',102.00,4,1,'Vestuário','Óculos','parcelado','Abril'],['Gympass',119.90,0,0,'Atividade Física','Academia','recorrente',null],['Anuidade',50.00,0,0,'Taxas',null,'recorrente',null],['Renner',86.56,3,1,'Vestuário','Roupas','parcelado','Abril'],['Drogasil',119.22,3,1,'Farmácia',null,'parcelado','Abril'],['Dengo',66.64,3,1,'Presente',null,'parcelado','Abril'],['Vonny',63.34,3,1,'Compras',null,'parcelado','Abril'],['Max Wendell',57.90,3,1,'Beleza','Salão','parcelado','Abril'],['Elabore',64.50,2,1,'Compras',null,'parcelado','Abril'],['Loja Física',32.11,3,1,'Compras',null,'parcelado','Abril'],['Petz - Assinatura',12.90,0,0,'Pet',null,'recorrente',null],['Drogasil',153.65,3,1,'Farmácia',null,'parcelado','Abril'],['Mercado Livre',28.54,3,1,'Suplementos',null,'parcelado','Abril'],['Gol',106.04,2,4,'Viagem',null,'parcelado','Junho'],['Supermercado Pinheiro',99.45,2,2,'Mercado',null,'parcelado','Maio'],['TAM',174.46,2,3,'Viagem',null,'parcelado','Junho'],['Cell Express',100.00,2,1,'Compras',null,'parcelado','Abril'],['Extra Farma',66.34,2,2,'Farmácia',null,'parcelado','Abril'],['Tecnoagil',114.50,2,1,'Compras',null,'parcelado','Abril'],['Petz Digital',80.09,2,1,'Pet',null,'parcelado','Abril'],['Farmácia',47.52,2,3,'Farmácia',null,'parcelado','Junho'],['Mercado Livre',137.18,2,1,'Suplementos',null,'parcelado','Abril'],['Mercado Livre',22.14,2,2,'Suplementos',null,'parcelado','Maio'],['Amazon',40.83,2,5,'Compras',null,'parcelado','Agosto'],['Mercado Livre',86.34,2,2,'Suplementos',null,'parcelado','Maio'],['Amazon',60.17,2,1,'Compras',null,'parcelado','Abril'],['São Luiz',178.18,0,0,'Mercado',null,'avista',null],['Shopee',91.75,0,0,'Compras',null,'avista',null],['CBD',252.49,1,3,'Farmácia',null,'parcelado','Junho'],['Petz',99.40,1,2,'Pet',null,'parcelado','Maio'],['Uber',31.99,0,0,'Uber',null,'avista',null],['IRP Comercio',73.54,0,0,'Mercado',null,'avista',null],['Uber',30.28,0,0,'Uber',null,'avista',null],['Extrafarma',73.08,1,4,'Farmácia',null,'parcelado','Julho'],['Mercado Livre',120.77,0,0,'Presente',null,'avista',null],['Camicado',70.02,1,5,'Compras',null,'parcelado','Julho'],['Drogasil',122.64,1,3,'Farmácia',null,'parcelado','Junho'],['Centauro',92.23,1,9,'Compras',null,'parcelado','Dezembro'],['Petz',73.03,0,0,'Pet',null,'avista',null],['Amazon',218.80,0,0,'Suplementos',null,'avista',null],['Job Recruiter',119.70,0,0,'Educação/Profissional',null,'avista',null],['Drogasil',72.95,1,6,'Farmácia',null,'parcelado','Abril'],['Uber',167.56,0,0,'Uber',null,'avista',null],['Mercado Livre',163.89,0,0,'Compras',null,'avista',null],['Ifood',65.88,0,0,'Ifood',null,'avista',null],['Plant Power',39.34,1,3,'Suplementos',null,'parcelado','Junho'],['Airbnb Recife',162.41,1,6,'Viagem',null,'parcelado','Setembro'],['Smiles',46.00,0,0,'Viagem',null,'recorrente',null] ].map(r=>({month:4,card:'Bradesco',store:r[0],amount:r[1],ic:r[2],it:r[3],cat:r[4],sub:r[5],type:r[6],end:r[7]})),
  // ABRIL - Santander
  ...[ ['Spotify',23.90,0,0,'Streamings',null,'recorrente',null],['C&A',92.51,4,1,'Vestuário',null,'parcelado','Abril'],['Shein',75.08,3,3,'Vestuário',null,'parcelado','Junho'],['Google One',96.99,0,0,'Streamings',null,'recorrente',null],['Apple',66.90,0,0,'Streamings',null,'recorrente',null],['Netflix',20.90,0,0,'Streamings',null,'recorrente',null],['Drogasil',53.15,2,2,'Farmácia',null,'parcelado','Maio'],['Mercadinho São Luiz',108.31,2,1,'Mercado',null,'parcelado','Abril'],['Nutriceara',48.50,4,1,'Suplementos',null,'parcelado','Abril'],['São Luiz',18.22,0,0,'Mercado',null,'avista',null],['Extrafarma',17.89,0,0,'Farmácia',null,'avista',null],['Flozo',86.00,0,0,'Beleza',null,'avista',null],['São Luiz',36.48,0,0,'Mercado',null,'avista',null],['São Luiz',75.79,0,0,'Mercado',null,'avista',null],['Posto',150.00,0,0,'Gasolina',null,'avista',null],['Freitas Varejo',63.69,1,7,'Compras',null,'parcelado','Outubro'],['Josi Unhas',235.00,0,0,'Beleza',null,'avista',null],['Yoomi',33.34,0,0,'Compras',null,'avista',null],['Mundo das Linhas',76.75,0,0,'Compras',null,'avista',null],['Stark',90.00,1,3,'Compras',null,'parcelado','Maio'],['Mercadinho Prédio',21.98,0,0,'Mercado',null,'avista',null],['Paulinho da Maraponga',44.56,0,0,'Alimentação',null,'avista',null],['JCT Estacionamento',12.00,0,0,'Estacionamento',null,'avista',null],['Mormaço',51.69,0,0,'Compras',null,'avista',null],['Cacao Confeitaria',32.80,0,0,'Alimentação',null,'avista',null],['Extra',95.51,0,0,'Mercado',null,'avista',null],['Center Box',33.14,0,0,'Mercado',null,'avista',null],['Fundação Batista',63.00,0,0,'Compras',null,'avista',null] ].map(r=>({month:4,card:'Santander',store:r[0],amount:r[1],ic:r[2],it:r[3],cat:r[4],sub:r[5],type:r[6],end:r[7]})),
  // MAIO - Bradesco
  ...[ ['Apple',116.70,0,0,'Streamings',null,'recorrente',null],['Smiles',46.00,0,0,'Viagem',null,'recorrente',null],['Petz - Assinatura',12.90,0,0,'Pet',null,'recorrente',null],['Amazon',67.84,4,7,'Presente',null,'parcelado','Outubro'],['Shoppe',50.30,2,4,'Compras',null,'parcelado','Agosto'],['Gol',106.04,3,3,'Viagem',null,'parcelado','Junho'],['Supermercado Pinheiro',99.45,3,1,'Mercado',null,'parcelado','Maio'],['TAM',174.44,3,2,'Viagem',null,'parcelado','Junho'],['Farmácia PGM',47.49,3,2,'Farmácia',null,'parcelado','Junho'],['Mercado Livre',22.13,3,1,'Suplementos',null,'parcelado','Maio'],['Amazon',40.83,3,4,'Compras',null,'parcelado','Agosto'],['Mercado Livre',86.33,3,1,'Suplementos',null,'parcelado','Maio'],['CBD',252.47,2,2,'Farmácia',null,'parcelado','Junho'],['Petz',99.39,2,1,'Pet',null,'parcelado','Maio'],['Extrafarma',66.34,3,2,'Farmácia',null,'parcelado','Julho'],['Extrafarma',73.05,2,3,'Farmácia',null,'parcelado','Julho'],['Camicado',69.99,2,4,'Compras',null,'parcelado','Julho'],['Drogasil',122.63,2,2,'Farmácia',null,'parcelado','Junho'],['Centauro',92.22,2,8,'Compras',null,'parcelado','Dezembro'],['Plant Power',39.35,2,2,'Suplementos',null,'parcelado','Junho'],['Airbnb Recife',162.41,2,5,'Viagem',null,'parcelado','Setembro'],['Adcos',83.36,2,1,'Beleza',null,'parcelado','Maio'],['KOP Iguatemi',101.70,0,0,'Presente',null,'avista',null],['KOP Iguatemi',11.90,0,0,'Presente',null,'avista',null],['Petz',300.58,0,0,'Pet',null,'avista',null],['Lindona',61.98,0,0,'Beleza',null,'avista',null],['Bel',51.38,0,0,'Beleza',null,'avista',null],['Avianca',178.60,1,10,'Viagem',null,'parcelado','Fevereiro'],['Drogasil',101.38,1,3,'Farmácia',null,'parcelado','Junho'],['Lindona',79.46,1,6,'Beleza',null,'parcelado','Outubro'],['Posto',100.00,0,0,'Gasolina',null,'avista',null],['Vivi',120.00,0,0,'Beleza',null,'avista',null],['Azava',106.58,1,3,'Vestuário',null,'parcelado','Julho'],['PGM',42.99,1,2,'Farmácia',null,'parcelado','Junho'],['Ticket mais Brennand',120.00,0,0,'Viagem',null,'avista',null],['Granado',51.84,1,3,'Presente',null,'parcelado','Julho'],['Uartes',78.73,1,3,'Compras',null,'parcelado','Julho'],['Mikaelly Doces',58.00,0,0,'Alimentação',null,'avista',null],['Uber',34.40,0,0,'Uber',null,'avista',null] ].map(r=>({month:5,card:'Bradesco',store:r[0],amount:r[1],ic:r[2],it:r[3],cat:r[4],sub:r[5],type:r[6],end:r[7]})),
  // MAIO - Santander
  ...[ ['Spotify',23.90,0,0,'Streamings',null,'recorrente',null],['Gympass',119.90,0,0,'Atividade Física','Academia','recorrente',null],['Google One',96.99,0,0,'Streamings',null,'recorrente',null],['Netflix',20.90,0,0,'Streamings',null,'recorrente',null],['Shein',75.05,4,2,'Vestuário',null,'parcelado','Junho'],['Drogasil',53.14,3,1,'Farmácia',null,'parcelado','Maio'],['Freitas Varejo',63.68,2,6,'Compras',null,'parcelado','Outubro'],['Stark',90.00,2,1,'Compras',null,'parcelado','Maio'],['CenterBox',48.12,2,1,'Mercado',null,'parcelado','Junho'],['Yoomi',33.33,2,2,'Beleza',null,'parcelado','Junho'],['Mercado Livre',40.73,0,0,'Compras',null,'avista',null],['Amazon',35.15,1,6,'Pet',null,'parcelado','Outubro'],['Hamburguer Lindboi',83.90,0,0,'Alimentação',null,'avista',null],['Kopenhagem',119.90,0,0,'Presente',null,'avista',null],['Normatel',58.09,0,0,'Compras',null,'avista',null],['Fortaleza Iguatemi',73.70,0,0,'Compras',null,'avista',null],['Madero',79.20,0,0,'Alimentação',null,'avista',null],['Laguna',118.80,0,0,'Vestuário',null,'avista',null],['Cosbel',66.48,1,4,'Beleza',null,'parcelado','Julho'],['Mercadinho NEO',14.00,0,0,'Mercado',null,'avista',null],['Center Box',85.20,0,0,'Mercado',null,'avista',null],['Maria Pitanga',15.63,0,0,'Alimentação',null,'avista',null],['Mercadinho Zaragoza',96.41,0,0,'Mercado',null,'avista',null],['Cacau Show',125.97,0,0,'Presente',null,'avista',null],['Pão de Açúcar',145.58,0,0,'Mercado',null,'avista',null],['Gasolina',100.00,0,0,'Gasolina',null,'avista',null],['Uber',145.14,0,0,'Uber',null,'avista',null],['Park Pet',70.00,0,0,'Pet',null,'avista',null],['Encetur',270.15,0,0,'Presente',null,'avista',null],['Arrumação Bar',86.00,0,0,'Alimentação',null,'avista',null],['De bem com a vida',54.30,0,0,'Suplementos',null,'avista',null],['Cobasi',127.88,0,0,'Pet',null,'avista',null],['São Luiz',41.43,0,0,'Mercado',null,'avista',null],['Saladex',55.00,0,0,'Alimentação',null,'avista',null],['Cacao',26.90,0,0,'Alimentação',null,'avista',null],['West Presentes',15.98,0,0,'Presente',null,'avista',null],['Gastronomia Boemia',85.50,0,0,'Alimentação',null,'avista',null] ].map(r=>({month:5,card:'Santander',store:r[0],amount:r[1],ic:r[2],it:r[3],cat:r[4],sub:r[5],type:r[6],end:r[7]})),
];

async function main() {
  console.log('🔐 Fazendo login...');
  const { token } = await post('/auth/login', { email: 'alicelinsc.malzac@gmail.com', password: '123456' });
  if (!token) { console.error('Login falhou'); process.exit(1); }
  console.log('✅ Login OK');

  // 1. Meses
  console.log('\n📅 Criando 12 meses de 2026...');
  const monthIds = {};
  for (const inc of incomeData) {
    const res = await put(`/months/2026/${inc.month}`, { salary: inc.salary, extra: inc.extra, philippe: inc.philippe, previous_balance: inc.previous_balance }, token);
    monthIds[inc.month] = res.id;
    process.stdout.write('.');
  }
  console.log(' OK');

  // 2. Contas fixas
  console.log('\n🏠 Inserindo contas fixas...');
  for (const [monthNum, expenses] of Object.entries(fixedByMonth)) {
    const mid = monthIds[Number(monthNum)];
    for (const [category, amount] of expenses) {
      await post(`/expenses/${mid}`, { category, amount }, token);
    }
    process.stdout.write('.');
  }
  console.log(' OK');

  // 3. Cartões
  console.log('\n💳 Criando cartões...');
  const cardIds = {};
  for (const name of ['Bradesco', 'Santander', 'Renner']) {
    const res = await post('/cards/', { name }, token);
    cardIds[name] = res.id;
    console.log(`  ${name} → id ${res.id}`);
  }

  // 4. Categorias
  console.log('\n🗂️  Criando categorias...');
  for (const [name, monthly_goal] of categories) {
    await post('/expenses/categories', { name, monthly_goal }, token);
    process.stdout.write('.');
  }
  console.log(' OK');

  // 5. Lançamentos de cartão
  console.log('\n💸 Inserindo lançamentos de cartão...');
  let count = 0;
  for (const t of cardTx) {
    const mid = monthIds[t.month];
    const cid = cardIds[t.card];
    if (!mid || !cid) { console.warn(`Skipping: month=${t.month} card=${t.card}`); continue; }
    await post(`/cards/transactions/${mid}`, {
      card_id: cid, store: t.store, amount: t.amount,
      installment_current: t.ic || 1, installment_total: t.it || 1,
      category: t.cat || '', subcategory: t.sub || '',
      payment_type: t.type || 'avista', end_month: t.end || '',
    }, token);
    count++;
    if (count % 20 === 0) process.stdout.write('.');
  }
  console.log(` OK (${count} lançamentos)`);

  console.log('\n✅ Banco de produção populado com sucesso!');
}

main().catch(console.error);
