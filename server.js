const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = req.body.folderPath || '';
    const uploadPath = path.join(__dirname, 'uploads', folderPath);
    
    // Ensure directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename while preserving extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, baseName + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Helper function to read/write data
function readData() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'files.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { folders: [{ id: 'root', name: 'Root', parent: null, path: '' }], files: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(path.join(__dirname, 'data', 'files.json'), JSON.stringify(data, null, 2));
}

// Generate simple UUID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// API Routes

// Get all folders and files
app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

// Create folder
app.post('/api/folders', (req, res) => {
  const { name, parentId } = req.body;
  const data = readData();
  
  const parent = data.folders.find(f => f.id === parentId) || data.folders[0];
  const folderPath = parent.path ? `${parent.path}/${name}` : name;
  
  const newFolder = {
    id: generateId(),
    name,
    parent: parentId || 'root',
    path: folderPath,
    createdAt: new Date().toISOString()
  };
  
  // Create physical directory
  const physicalPath = path.join(__dirname, 'uploads', folderPath);
  fs.mkdirSync(physicalPath, { recursive: true });
  
  data.folders.push(newFolder);
  writeData(data);
  
  res.json(newFolder);
});

// Rename folder
app.put('/api/folders/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const data = readData();
  
  const folder = data.folders.find(f => f.id === id);
  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' });
  }
  
  const oldPath = path.join(__dirname, 'uploads', folder.path);
  const parent = data.folders.find(f => f.id === folder.parent);
  const newPath = parent && parent.path ? `${parent.path}/${name}` : name;
  const newPhysicalPath = path.join(__dirname, 'uploads', newPath);
  
  // Rename physical directory
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPhysicalPath);
  }
  
  folder.name = name;
  folder.path = newPath;
  
  writeData(data);
  res.json(folder);
});

// Delete folder
app.delete('/api/folders/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  
  if (id === 'root') {
    return res.status(400).json({ error: 'Cannot delete root folder' });
  }
  
  const folder = data.folders.find(f => f.id === id);
  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' });
  }
  
  // Remove physical directory
  const physicalPath = path.join(__dirname, 'uploads', folder.path);
  if (fs.existsSync(physicalPath)) {
    fs.rmSync(physicalPath, { recursive: true, force: true });
  }
  
  // Remove from data (also removes child folders and files)
  data.folders = data.folders.filter(f => f.id !== id && !f.path.startsWith(folder.path + '/'));
  data.files = data.files.filter(f => !f.path.startsWith(folder.path + '/'));
  
  writeData(data);
  res.json({ success: true });
});

// Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const { description, tags, uploaderName, folderId } = req.body;
  const data = readData();
  
  const folder = data.folders.find(f => f.id === folderId) || data.folders[0];
  const filePath = folder.path ? `${folder.path}/${req.file.filename}` : req.file.filename;
  
  const fileMetadata = {
    id: generateId(),
    filename: req.file.originalname,
    storedFilename: req.file.filename,
    path: filePath,
    size: req.file.size,
    mimetype: req.file.mimetype,
    description: description || '',
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
    uploaderName: uploaderName || 'Unknown',
    uploadDate: new Date().toISOString(),
    folderId: folderId || 'root'
  };
  
  data.files.push(fileMetadata);
  writeData(data);
  
  res.json(fileMetadata);
});

// Download file
app.get('/api/download/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  
  const file = data.files.find(f => f.id === id);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const filePath = path.join(__dirname, 'uploads', file.path);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on disk' });
  }
  
  res.download(filePath, file.filename);
});

// Delete file
app.delete('/api/files/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  
  const file = data.files.find(f => f.id === id);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Remove physical file
  const filePath = path.join(__dirname, 'uploads', file.path);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Remove from data
  data.files = data.files.filter(f => f.id !== id);
  writeData(data);
  
  res.json({ success: true });
});

// Update file metadata
app.put('/api/files/:id', (req, res) => {
  const { id } = req.params;
  const { description, tags } = req.body;
  const data = readData();
  
  const file = data.files.find(f => f.id === id);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  file.description = description;
  file.tags = tags ? tags.split(',').map(t => t.trim()) : [];
  
  writeData(data);
  res.json(file);
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`File Vault server running on http://localhost:${PORT}`);
});