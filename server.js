const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ENQUIRY_FILE = path.join(__dirname, 'enquiries.json');

// Save enquiry
app.post('/api/enquiry', (req, res) => {
  const data = req.body;
  let all = [];
  try {
    if (fs.existsSync(ENQUIRY_FILE)) {
      all = JSON.parse(fs.readFileSync(ENQUIRY_FILE, 'utf8'));
    }
  } catch (e) { all = []; }
  all.push({...data, created: new Date().toISOString()});
  fs.writeFileSync(ENQUIRY_FILE, JSON.stringify(all, null, 2));
  res.json({success:true});
});

// Admin page (for demo - protect in real use!)
app.get('/admin/enquiries', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'enquiries-admin.html'));
});

// API to fetch all enquiries
app.get('/api/enquiries', (req, res) => {
  if (!fs.existsSync(ENQUIRY_FILE)) return res.json([]);
  const all = JSON.parse(fs.readFileSync(ENQUIRY_FILE, 'utf8'));
  res.json(all);
});

// API to download CSV
app.get('/api/enquiries/csv', (req, res) => {
  if (!fs.existsSync(ENQUIRY_FILE)) return res.send('');
  const all = JSON.parse(fs.readFileSync(ENQUIRY_FILE, 'utf8'));
  if (!all.length) return res.send('');
  const fields = Object.keys(all[0]);
  const csv = [fields.join(',')]
    .concat(all.map(row => fields.map(f => `"${String(row[f]||'').replace(/"/g, '""')}"`).join(',')))
    .join('\n');
  res.header('Content-Type', 'text/csv');
  res.attachment('enquiries.csv');
  res.send(csv);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));