const express = require('express');
const cors = require('cors');
require('./db/schema'); // inicializa o banco

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/months', require('./routes/months'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/cash', require('./routes/cash'));

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));
