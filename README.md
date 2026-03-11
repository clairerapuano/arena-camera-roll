# Arena Camera Roll

A simple gallery that displays images from an Are.na channel.

## Running the Project

Since this is a static website, you need to serve it through a local web server. Here are a few options:

### Option 1: Python HTTP Server (Recommended)
```bash
# Python 3
python3 -m http.server 8000

# Python 2 (if you have it)
python -m SimpleHTTPServer 8000
```

Then open your browser to: `http://localhost:8000`

### Option 2: Node.js http-server
If you have Node.js installed:
```bash
npx http-server -p 8000
```

### Option 3: VS Code Live Server
If you're using VS Code, install the "Live Server" extension and click "Go Live" in the bottom toolbar.

### Option 4: Any Local Server
You can use any local web server. Just make sure it serves the files from the project root directory.

## Configuration

Edit `script.js` and change the `channel_title` variable on line 2 to point to your Are.na channel slug:
```javascript
let channel_title = 'camera-roll-nnn9n8atmm0';
```

## Notes

- The project fetches images from Are.na's public API
- It supports keyboard navigation (arrow keys, Escape)
- Click on thumbnails to view full-size images

