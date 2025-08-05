const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db'); // MySQL connection

const app = express();
const PORT = process.env.PORT || 8080;
const userId = 1;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing.html'));
  });
  
  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'portfolio-dashboard.html'));
  });



// Get all assets
app.get('/api/assets', (req, res) => {
  const sql = 'SELECT * FROM assets WHERE user_id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch assets' });
    res.json(results);
  });
});

// Add new asset
app.post('/api/assets', (req, res) => {
  const { asset_name, asset_type, quantity, purchase_price, purchase_date } = req.body;
  const sql = `
    INSERT INTO assets (user_id, asset_name, asset_type, quantity, purchase_price, purchase_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [userId, asset_name, asset_type, quantity, purchase_price, purchase_date], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to add asset' });
    res.json({ id: result.insertId, message: 'Asset added' });
  });
});

// Delete asset
app.delete('/api/assets/:id', (req, res) => {
  const assetId = req.params.id;
  const sql = 'DELETE FROM assets WHERE id = ? AND user_id = ?';
  db.query(sql, [assetId, userId], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete asset' });
    res.json({ message: 'Asset deleted' });
  });
});

// Get portfolio summary
app.get('/api/summary', (req, res) => {
  const sql = `
    SELECT COUNT(*) AS total_assets, SUM(quantity * purchase_price) AS total_value
    FROM assets
    WHERE user_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch summary' });
    res.json(results[0]);
  });
});

// Get chart data: performance over time
app.get('/api/charts/performance', (req, res) => {
  const sql = `
    SELECT transaction_date, SUM(amount * price_per_unit) AS total_value
    FROM transactions
    WHERE user_id = ?
    GROUP BY transaction_date
    ORDER BY transaction_date
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to load performance data' });
    const labels = results.map(r => r.transaction_date);
    const values = results.map(r => parseFloat(r.total_value));
    res.json({ labels, values });
  });
});

// Get chart data: asset distribution by type
app.get('/api/charts/distribution', (req, res) => {
  const sql = `
    SELECT asset_type, SUM(quantity * purchase_price) AS total_value
    FROM assets
    WHERE user_id = ?
    GROUP BY asset_type
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to load distribution data' });
    const labels = results.map(r => r.asset_type);
    const values = results.map(r => parseFloat(r.total_value));
    res.json({ labels, values });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ FinSnap404 server running at http://localhost:${PORT}`);
});
