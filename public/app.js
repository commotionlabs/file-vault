class FileVault {
    constructor() {
        this.currentFolder = 'root';
        this.data = { folders: [], files: [] };
        this.selectedFiles = [];
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderFolders();
        this.renderFiles();
    }

    async loadData() {
        try {
            const response = await fetch('/api/data');
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        // Upload area click
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });
    }

    renderFolders() {
        const folderTree = document.getElementById('folderTree');
        folderTree.innerHTML = '';

        const rootFolders = this.data.folders.filter(f => f.parent === 'root' || f.parent === null);
        
        rootFolders.forEach(folder => {
            this.renderFolderItem(folder, folderTree);
        });
    }

    renderFolderItem(folder, container) {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="folder-item ${this.currentFolder === folder.id ? 'active' : ''}" 
                 onclick="app.selectFolder('${folder.id}')">
                <span class="folder-name">📁 ${folder.name}</span>
                <div class="folder-actions">
                    ${folder.id !== 'root' ? `
                        <button class="btn btn-sm" onclick="app.renameFolder('${folder.id}'); event.stopPropagation();">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteFolder('${folder.id}'); event.stopPropagation();">🗑️</button>
                    ` : ''}
                </div>
            </div>
        `;
        container.appendChild(li);

        // Render subfolders
        const subfolders = this.data.folders.filter(f => f.parent === folder.id);
        if (subfolders.length > 0) {
            const ul = document.createElement('ul');
            ul.style.marginLeft = '20px';
            subfolders.forEach(subfolder => {
                this.renderFolderItem(subfolder, ul);
            });
            li.appendChild(ul);
        }
    }

    selectFolder(folderId) {
        this.currentFolder = folderId;
        this.renderFolders();
        this.renderFiles();
        this.updateBreadcrumb();
    }

    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        if (this.currentFolder === 'root') {
            breadcrumb.textContent = 'Home';
        } else {
            const folder = this.data.folders.find(f => f.id === this.currentFolder);
            breadcrumb.textContent = folder ? folder.path.replace(/\//g, ' / ') : 'Home';
        }
    }

    renderFiles() {
        const fileGrid = document.getElementById('fileGrid');
        const currentFiles = this.data.files.filter(f => f.folderId === this.currentFolder);
        
        fileGrid.innerHTML = '';
        
        currentFiles.forEach(file => {
            const fileCard = this.createFileCard(file);
            fileGrid.appendChild(fileCard);
        });
    }

    createFileCard(file) {
        const div = document.createElement('div');
        div.className = 'file-card';
        
        const icon = this.getFileIcon(file.mimetype);
        const size = this.formatFileSize(file.size);
        const date = new Date(file.uploadDate).toLocaleDateString();
        
        div.innerHTML = `
            <div class="file-icon" style="background: ${icon.color};">${icon.emoji}</div>
            <div class="file-name">${file.filename}</div>
            <div class="file-meta">${size} • ${date}</div>
            ${file.description ? `<div style="font-size: 12px; color: #666; margin-bottom: 8px;">${file.description}</div>` : ''}
            <div class="file-tags">
                ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="file-actions">
                <button class="btn btn-sm" onclick="app.downloadFile('${file.id}')">⬇️</button>
                <button class="btn btn-sm" onclick="app.editFile('${file.id}')">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="app.deleteFile('${file.id}')">🗑️</button>
            </div>
        `;
        
        return div;
    }

    getFileIcon(mimetype) {
        const type = mimetype ? mimetype.split('/')[0] : 'unknown';
        
        // Using dashboard chart colors for vibrant file type icons
        const icons = {
            image: { emoji: '🖼️', color: 'oklch(0.646 0.222 41.116)' }, // chart-1: warm orange
            video: { emoji: '🎬', color: 'oklch(0.828 0.189 84.429)' }, // chart-4: bright green
            audio: { emoji: '🎵', color: 'oklch(0.769 0.188 70.08)' }, // chart-5: warm yellow
            text: { emoji: '📄', color: 'oklch(0.6 0.118 184.704)' }, // chart-2: cool blue
            application: { emoji: '📎', color: 'oklch(0.398 0.07 227.392)' } // chart-3: deep purple
        };
        
        return icons[type] || { emoji: '📄', color: 'oklch(0.556 0 0)' }; // muted gray for unknown
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    handleFileSelect(files) {
        this.selectedFiles = Array.from(files);
        this.showUploadModal();
    }

    showUploadModal() {
        const modal = document.getElementById('uploadModal');
        const filesList = document.getElementById('uploadFilesList');
        
        filesList.innerHTML = `
            <div class="form-group">
                <label class="form-label">Selected Files (${this.selectedFiles.length})</label>
                <div style="max-height: 150px; overflow-y: auto; border: 1px solid #d1d5db; border-radius: 5px; padding: 10px;">
                    ${this.selectedFiles.map(f => `<div>${f.name} (${this.formatFileSize(f.size)})</div>`).join('')}
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    async uploadFiles() {
        const description = document.getElementById('fileDescription').value;
        const tags = document.getElementById('fileTags').value;
        const uploaderName = document.getElementById('uploaderName').value;
        
        for (const file of this.selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('description', description);
            formData.append('tags', tags);
            formData.append('uploaderName', uploaderName);
            formData.append('folderId', this.currentFolder);
            
            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Upload failed');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                alert(`Error uploading ${file.name}: ${error.message}`);
            }
        }
        
        this.hideModal('uploadModal');
        await this.loadData();
        this.renderFiles();
        
        // Clear form
        document.getElementById('fileDescription').value = '';
        document.getElementById('fileTags').value = '';
    }

    showCreateFolderModal() {
        document.getElementById('createFolderModal').style.display = 'block';
    }

    async createFolder() {
        const name = document.getElementById('folderNameInput').value.trim();
        if (!name) return;
        
        try {
            const response = await fetch('/api/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    parentId: this.currentFolder === 'root' ? null : this.currentFolder 
                })
            });
            
            if (response.ok) {
                this.hideModal('createFolderModal');
                document.getElementById('folderNameInput').value = '';
                await this.loadData();
                this.renderFolders();
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    }

    async renameFolder(folderId) {
        const folder = this.data.folders.find(f => f.id === folderId);
        const newName = prompt('Enter new folder name:', folder.name);
        if (!newName || newName === folder.name) return;
        
        try {
            const response = await fetch(`/api/folders/${folderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            
            if (response.ok) {
                await this.loadData();
                this.renderFolders();
            }
        } catch (error) {
            console.error('Error renaming folder:', error);
        }
    }

    async deleteFolder(folderId) {
        const folder = this.data.folders.find(f => f.id === folderId);
        if (!confirm(`Delete folder "${folder.name}" and all its contents?`)) return;
        
        try {
            const response = await fetch(`/api/folders/${folderId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                if (this.currentFolder === folderId) {
                    this.currentFolder = 'root';
                }
                await this.loadData();
                this.renderFolders();
                this.renderFiles();
            }
        } catch (error) {
            console.error('Error deleting folder:', error);
        }
    }

    async deleteFile(fileId) {
        const file = this.data.files.find(f => f.id === fileId);
        if (!confirm(`Delete file "${file.filename}"?`)) return;
        
        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await this.loadData();
                this.renderFiles();
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    downloadFile(fileId) {
        window.open(`/api/download/${fileId}`, '_blank');
    }

    async editFile(fileId) {
        const file = this.data.files.find(f => f.id === fileId);
        const description = prompt('Enter file description:', file.description || '');
        const tags = prompt('Enter tags (comma-separated):', file.tags.join(', '));
        
        if (description !== null || tags !== null) {
            try {
                const response = await fetch(`/api/files/${fileId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        description: description || file.description,
                        tags: tags || file.tags.join(', ')
                    })
                });
                
                if (response.ok) {
                    await this.loadData();
                    this.renderFiles();
                }
            } catch (error) {
                console.error('Error updating file:', error);
            }
        }
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
}

// Global functions for onclick handlers
function showCreateFolderModal() {
    app.showCreateFolderModal();
}

function hideModal(modalId) {
    app.hideModal(modalId);
}

function createFolder() {
    app.createFolder();
}

function uploadFiles() {
    app.uploadFiles();
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FileVault();
});