# How to Run on Windows

## Quick Start

1. **Extract the project** to a folder (e.g., `C:\Users\poncipp\Downloads\Whatwouldyourather`)

2. **Double-click** `start_server.bat`
   
   OR open Command Prompt in the project folder and run:
   ```cmd
   python server.py
   ```

3. **Open your browser** to: http://localhost:8080

## Troubleshooting

### "Assets not found" or 404 errors

Make sure you're running `server.py` from the **project root folder**, not from the `src` folder.

**Correct:**
```
C:\Users\poncipp\Downloads\Whatwouldyourather> python server.py
```

**Wrong:**
```
C:\Users\poncipp\Downloads\Whatwouldyourather\src> python server.py
```

### Server shows wrong directory

When you start the server, you should see:

```
📂 Working directory: C:\Users\poncipp\Downloads\Whatwouldyourather
📂 File structure:
   ✓ src/index.html exists: True
   ✓ assets/ exists: True
   ✓ src/config.js exists: True
```

If it shows `False` for any of these, you're in the wrong directory!

### Python not found

Install Python from https://python.org (make sure to check "Add to PATH" during installation)

## Project Structure

```
Whatwouldyourather/
├── server.py          ← Run this!
├── start_server.bat   ← Or double-click this!
├── src/
│   ├── index.html
│   ├── config.js
│   ├── js/
│   └── css/
└── assets/
    ├── images/
    └── audio/
```
