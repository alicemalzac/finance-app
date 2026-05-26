const express = require('express');
const cors = require('cors');
const db = require('./db/schema');

const app = express();
app.use(cors());
app.use(express.json());

// Registra última alteração após qualquer escrita bem-sucedida
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        db.prepare("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('last_updated_at', ?)").run(new Date().toISOString());
      }
    });
  }
  next();
});

app.get('/api/meta/last-updated', (req, res) => {
  const row = db.prepare("SELECT value FROM app_meta WHERE key='last_updated_at'").get();
  res.json({ last_updated_at: row?.value || null });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/months', require('./routes/months'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/cash', require('./routes/cash'));

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));
