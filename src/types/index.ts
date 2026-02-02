export interface FileVaultFile {
  id: string;
  filename: string;
  storedFilename: string;
  path: string;
  size: number;
  mimetype: string;
  description: string;
  tags: string[];
  uploaderName: string;
  uploadDate: string;
  folderId: string;
}

export interface Folder {
  id: string;
  name: string;
  parent: string | null;
  path: string;
  createdAt?: string;
}

export interface FileVaultData {
  folders: Folder[];
  files: FileVaultFile[];
}

export interface FileUploadData {
  description?: string;
  tags?: string;
  uploaderName?: string;
  folderId?: string;
}