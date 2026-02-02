'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Upload, 
  Download, 
  FolderPlus, 
  File, 
  Folder,
  Search,
  Grid,
  List,
  Calendar,
  User,
  Tag
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  uploader: string;
  uploadDate: string;
  size: number;
  type: string;
  folderId?: string;
}

interface FolderItem {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
  fileCount: number;
}

export default function FileVaultPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  // Mock data for development
  useEffect(() => {
    const mockFiles: FileItem[] = [
      {
        id: '1',
        name: 'project-specs.pdf',
        description: 'Project specifications document',
        tags: ['specs', 'project'],
        uploader: 'Gideon',
        uploadDate: '2026-02-01',
        size: 2048576,
        type: 'application/pdf',
        folderId: 'folder1'
      },
      {
        id: '2',
        name: 'budget-analysis.xlsx',
        description: 'Q1 budget analysis spreadsheet',
        tags: ['budget', 'finance'],
        uploader: 'Arcus',
        uploadDate: '2026-02-02',
        size: 1024000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    ];

    const mockFolders: FolderItem[] = [
      {
        id: 'folder1',
        name: 'Project Documents',
        description: 'Main project documentation',
        createdDate: '2026-01-28',
        fileCount: 5
      },
      {
        id: 'folder2',
        name: 'Financial Records',
        description: 'Budget and financial documents',
        createdDate: '2026-01-30',
        fileCount: 3
      }
    ];

    setFiles(mockFiles);
    setFolders(mockFolders);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => 
    (!selectedFolder || file.folderId === selectedFolder) &&
    (file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                File Vault
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Organize and manage your files with folders and metadata
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input placeholder="Folder name" />
                    <Input placeholder="Description (optional)" />
                    <Button className="w-full">Create Folder</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">
                        Drag and drop files here, or click to select
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search files and folders..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Folders */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Folder className="w-5 h-5 mr-2" />
                  Folders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedFolder === null ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder(null)}
                >
                  <File className="w-4 h-4 mr-2" />
                  All Files
                </Button>
                {folders.map((folder) => (
                  <Button
                    key={folder.id}
                    variant={selectedFolder === folder.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder(folder.id)}
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    <span className="truncate">{folder.name}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {folder.fileCount}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Files */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>
                    {selectedFolder 
                      ? folders.find(f => f.id === selectedFolder)?.name 
                      : 'All Files'
                    }
                  </span>
                  <Badge variant="outline">
                    {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFiles.map((file) => (
                      <Card key={file.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <File className="w-8 h-8 text-blue-500 flex-shrink-0" />
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                          <h3 className="font-medium text-sm mb-1 truncate" title={file.name}>
                            {file.name}
                          </h3>
                          {file.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                              {file.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {file.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {file.uploader}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {file.uploadDate}
                            </div>
                            <div>{formatFileSize(file.size)}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <File className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            {file.description && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                {file.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                          <span>{file.uploader}</span>
                          <span>{file.uploadDate}</span>
                          <span>{formatFileSize(file.size)}</span>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}