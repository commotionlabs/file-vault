import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { FileVaultData } from '@/types';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = await request.json();
    const data = await readData();
    
    const folder = data.folders.find(f => f.id === id);
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }
    
    const oldPath = path.join(UPLOADS_DIR, folder.path);
    const parent = data.folders.find(f => f.id === folder.parent);
    const newPath = parent && parent.path ? `${parent.path}/${name}` : name;
    const newPhysicalPath = path.join(UPLOADS_DIR, newPath);
    
    // Rename physical directory
    try {
      await fs.access(oldPath);
      await fs.rename(oldPath, newPhysicalPath);
    } catch (error) {
      // Directory might not exist, which is fine
    }
    
    folder.name = name;
    folder.path = newPath;
    
    await writeData(data);
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error renaming folder:', error);
    return NextResponse.json(
      { error: 'Failed to rename folder' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await readData();
    
    if (id === 'root') {
      return NextResponse.json(
        { error: 'Cannot delete root folder' },
        { status: 400 }
      );
    }
    
    const folder = data.folders.find(f => f.id === id);
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }
    
    // Remove physical directory
    const physicalPath = path.join(UPLOADS_DIR, folder.path);
    try {
      await fs.access(physicalPath);
      await fs.rm(physicalPath, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, which is fine
    }
    
    // Remove from data (also removes child folders and files)
    data.folders = data.folders.filter(f => f.id !== id && !f.path.startsWith(folder.path + '/'));
    data.files = data.files.filter(f => !f.path.startsWith(folder.path + '/'));
    
    await writeData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}