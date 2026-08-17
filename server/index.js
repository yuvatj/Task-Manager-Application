import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const DB_PATH = path.join(__dirname, 'database.json');
const UPLOADS_PATH = path.join(__dirname, 'uploads');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_PATH));

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
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
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { tasks: [], projects: [], users: [] };
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

app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
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
