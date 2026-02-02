import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { FileVaultData, Folder } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'files.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

async function readData(): Promise<FileVaultData> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { folders: [{ id: 'root', name: 'Root', parent: null, path: '' }], files: [] };
  }
}

async function writeData(data: FileVaultData) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function POST(request: NextRequest) {
  try {
    const { name, parentId } = await request.json();
    const data = await readData();
    
    const parent = data.folders.find(f => f.id === parentId) || data.folders[0];
    const folderPath = parent.path ? `${parent.path}/${name}` : name;
    
    const newFolder: Folder = {
      id: generateId(),
      name,
      parent: parentId || 'root',
      path: folderPath,
      createdAt: new Date().toISOString()
    };
    
    // Create physical directory
    const physicalPath = path.join(UPLOADS_DIR, folderPath);
    await fs.mkdir(physicalPath, { recursive: true });
    
    data.folders.push(newFolder);
    await writeData(data);
    
    return NextResponse.json(newFolder);
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}