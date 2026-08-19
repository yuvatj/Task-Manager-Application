import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const DB_PATH = path.join(__dirname, 'database.json');
const SEED_PATH = path.join(__dirname, 'database.seed.json');
const UPLOADS_PATH = path.join(__dirname, 'uploads');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_PATH));

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

// Bootstrap the runtime database from the seed on first run
if (!fs.existsSync(DB_PATH) && fs.existsSync(SEED_PATH)) {
  fs.copyFileSync(SEED_PATH, DB_PATH);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_PATH);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage });

// Helper to read/write DB
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(data);
    if (!db.admins) db.admins = [];
    if (!db.members) db.members = [];
    return db;
  } catch (error) {
    console.error('Error reading database:', error);
    return { tasks: [], projects: [], users: [], admins: [], members: [] };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
  }
};

// API Routes
app.get('/api/tasks', (req, res) => {
  const db = readDB();
  res.json(db.tasks);
});

app.post('/api/tasks', (req, res) => {
  const db = readDB();
  const newTask = { ...req.body, id: uuidv4(), createdAt: new Date().toISOString() };
  db.tasks.push(newTask);
  writeDB(db);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const db = readDB();
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    db.tasks[index] = { ...db.tasks[index], ...req.body };
    writeDB(db);
    res.json(db.tasks[index]);
  } else {
    res.status(404).send('Task not found');
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const db = readDB();
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  writeDB(db);
  res.status(204).send();
});

app.get('/api/projects', (req, res) => {
  const db = readDB();
  res.json(db.projects);
});

app.post('/api/projects', (req, res) => {
  const db = readDB();
  const newProject = { ...req.body, id: uuidv4(), createdAt: new Date().toISOString() };
  db.projects.push(newProject);
  writeDB(db);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req, res) => {
  const db = readDB();
  const index = db.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).send('Project not found');
  }
  db.projects[index] = { ...db.projects[index], ...req.body };
  writeDB(db);
  res.json(db.projects[index]);
});

app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

// Admin auth routes
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const db = readDB();
  const normalizedEmail = email.trim().toLowerCase();
  if (db.admins.some(a => a.email === normalizedEmail)) {
    return res.status(409).json({ error: 'An admin account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newAdmin = {
    id: uuidv4(),
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString()
  };
  db.admins.push(newAdmin);
  writeDB(db);

  const { passwordHash: _omit, ...safeAdmin } = newAdmin;
  res.status(201).json(safeAdmin);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = readDB();
  const normalizedEmail = email.trim().toLowerCase();
  const account = db.admins.find(a => a.email === normalizedEmail) || db.members.find(m => m.email === normalizedEmail);
  if (!account) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const match = await bcrypt.compare(password, account.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { passwordHash: _omit, ...safeAccount } = account;
  res.json(safeAccount);
});

// Member accounts (created by an admin — no self-serve signup)
app.get('/api/auth/members', (req, res) => {
  const db = readDB();
  res.json(db.members.map(({ passwordHash, ...safe }) => safe));
});

app.post('/api/auth/create-member', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const db = readDB();
  const normalizedEmail = email.trim().toLowerCase();
  if (db.admins.some(a => a.email === normalizedEmail) || db.members.some(m => m.email === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newMember = {
    id: uuidv4(),
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'member',
    createdAt: new Date().toISOString()
  };
  db.members.push(newMember);
  writeDB(db);

  const { passwordHash: _omit, ...safeMember } = newMember;
  res.status(201).json(safeMember);
});

app.delete('/api/auth/members/:id', (req, res) => {
  const db = readDB();
  const before = db.members.length;
  db.members = db.members.filter(m => m.id !== req.params.id);
  if (db.members.length === before) {
    return res.status(404).json({ error: 'Member not found' });
  }
  writeDB(db);
  res.status(204).send();
});

app.post('/api/auth/change-password', async (req, res) => {
  const { id, currentPassword, newPassword } = req.body;
  if (!id || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const db = readDB();
  const admin = db.admins.find(a => a.id === id);
  if (!admin) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const match = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  writeDB(db);

  res.json({ ok: true });
});

app.put('/api/auth/profile', (req, res) => {
  const { id, name } = req.body;
  if (!id || !name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const db = readDB();
  const admin = db.admins.find(a => a.id === id);
  if (!admin) {
    return res.status(404).json({ error: 'Account not found' });
  }

  admin.name = name.trim();
  writeDB(db);

  const { passwordHash: _omit, ...safeAdmin } = admin;
  res.json(safeAdmin);
});

app.delete('/api/auth/account', async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const db = readDB();
  const index = db.admins.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const match = await bcrypt.compare(password, db.admins[index].passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Password is incorrect' });
  }

  db.admins.splice(index, 1);
  writeDB(db);

  res.status(204).send();
});

// File upload route
app.post('/api/upload', upload.array('files'), (req, res) => {
  const files = req.files.map(f => ({
    name: f.originalname,
    url: `http://localhost:${PORT}/uploads/${f.filename}`
  }));
  res.json(files);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
