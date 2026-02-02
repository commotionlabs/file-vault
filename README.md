# File Vault

A simple file management application with folder organization and metadata support. Designed for local access with a clean, functional interface.

## Features

- 📁 **Folder Organization**: Create, rename, and delete folders with hierarchical structure
- 📤 **File Upload**: Drag & drop or click to upload any file type
- 📥 **File Download**: Download files with original filenames
- 🏷️ **File Metadata**: Add descriptions, tags, uploader name, and automatic upload dates
- 🗂️ **File Management**: Edit metadata, delete files, and organize by folders
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🛡️ **Local Only**: No external dependencies or cloud storage - all files stored locally

## Tech Stack

- **Backend**: Node.js with Express.js
- **File Upload**: Multer middleware
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Data Storage**: JSON file (`data/files.json`)
- **File Storage**: Local filesystem (`uploads/` directory)

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd projects/file-vault
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser to:**
   ```
   http://localhost:3003
   ```

## Usage

### Folder Management

- **Create Folder**: Click the "+ New Folder" button in the sidebar
- **Select Folder**: Click on any folder name to view its contents
- **Rename Folder**: Hover over a folder and click the edit (✏️) icon
- **Delete Folder**: Hover over a folder and click the delete (🗑️) icon
  - ⚠️ This will delete all files and subfolders within it

### File Operations

- **Upload Files**: 
  - Drag and drop files onto the upload area
  - Or click the upload area to select files
  - Add optional metadata: description, tags, uploader name
  - Files are uploaded to the currently selected folder

- **Download Files**: Click the download (⬇️) button on any file card

- **Edit File Metadata**: Click the edit (✏️) button to modify description and tags

- **Delete Files**: Click the delete (🗑️) button to remove files

### File Information

Each file displays:
- **Filename**: Original upload filename
- **File Size**: Formatted size (KB, MB, GB)
- **Upload Date**: When the file was uploaded
- **Description**: Optional user-provided description
- **Tags**: Comma-separated tags for organization
- **File Type Icon**: Visual indicator based on MIME type

## File Storage

- **Files**: Stored in `uploads/` directory with unique filenames
- **Metadata**: Stored in `data/files.json` as JSON
- **Folders**: Created as physical directories in `uploads/`
- **File Limits**: 100MB per file (configurable in `server.js`)

## API Endpoints

### Folders
- `GET /api/data` - Get all folders and files
- `POST /api/folders` - Create new folder
- `PUT /api/folders/:id` - Rename folder
- `DELETE /api/folders/:id` - Delete folder and contents

### Files
- `POST /api/upload` - Upload file with metadata
- `GET /api/download/:id` - Download file
- `PUT /api/files/:id` - Update file metadata
- `DELETE /api/files/:id` - Delete file

## Configuration

### File Size Limit
Edit `server.js` line 30 to change the upload limit:
```javascript
limits: {
  fileSize: 100 * 1024 * 1024 // 100MB limit
}
```

### Port
Change the port by setting the `PORT` environment variable:
```bash
PORT=3002 npm start
```

Or edit `server.js` line 7:
```javascript
const PORT = process.env.PORT || 3003;
```

## Development

### Project Structure
```
file-vault/
├── server.js              # Express server with API endpoints
├── package.json            # Node.js dependencies
├── README.md              # This file
├── public/                # Frontend files
│   ├── index.html         # Main HTML page
│   └── app.js            # Frontend JavaScript
├── data/                  # Data storage
│   └── files.json        # File metadata
└── uploads/              # File storage directory
```

### Adding Features

The application is designed to be easily extensible:

- **New File Types**: Modify `getFileIcon()` in `app.js` to add custom icons
- **Additional Metadata**: Add fields to the upload form and update the API endpoints
- **Search/Filter**: Implement client-side filtering in the frontend
- **User Management**: Add authentication and user-specific folders

## Security Notes

- This application is designed for **local use only**
- No authentication is implemented
- Files are accessible via direct URL if the file ID is known
- For production use, consider adding:
  - User authentication
  - File access controls
  - Input validation and sanitization
  - HTTPS encryption

## Troubleshooting

### Server won't start
- Check if port 3001 is already in use
- Ensure Node.js is installed (requires Node.js 14+)
- Verify all dependencies are installed with `npm install`

### Upload fails
- Check file size (default limit: 100MB)
- Ensure `uploads/` directory exists and is writable
- Check server logs for error messages

### Files not displaying
- Verify `data/files.json` exists and is valid JSON
- Check browser console for JavaScript errors
- Refresh the page to reload data

## License

MIT License - feel free to modify and use for your projects.