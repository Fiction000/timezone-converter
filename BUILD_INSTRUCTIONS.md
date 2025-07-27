# Build Instructions

## Local Development

### Prerequisites
- Node.js 18+ 
- npm

### Setup
```bash
npm install
npm run build
npm start
```

## Building Executables

### Linux AppImage
```bash
npm run dist:linux
```
Output: `dist-electron/Timezone Converter-1.0.0.AppImage`

### Windows Executable (requires Windows or wine)
```bash
npm run dist:win
```
Output: `dist-electron/Timezone Converter Setup 1.0.0.exe` and `dist-electron/Timezone Converter 1.0.0.exe` (portable)

### macOS App (requires macOS)
```bash
npm run dist:mac
```
Output: `dist-electron/Timezone Converter-1.0.0.dmg`

### All Platforms
```bash
npm run dist
```

## Publishing to GitHub

### Setting up GitHub Repository

1. **Create GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/Fiction000/timezone-converter.git
   git push -u origin main
   ```

2. **Create a Release**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

### Automated Builds with GitHub Actions

The repository includes GitHub Actions workflows that will automatically:
- Build executables for Windows, macOS, and Linux
- Create GitHub releases with downloadable binaries
- Trigger on git tags (e.g., `v1.0.0`)

### Manual Release Process

If you prefer manual releases:

1. **Build locally** (on respective platforms):
   ```bash
   npm run dist:win    # On Windows
   npm run dist:mac    # On macOS  
   npm run dist:linux  # On Linux
   ```

2. **Create GitHub Release**:
   - Go to GitHub repository → Releases → Create a new release
   - Tag: `v1.0.0`
   - Title: `Timezone Converter v1.0.0`
   - Upload the built executables from `dist-electron/`

## Distribution Files

### Windows
- `Timezone Converter Setup 1.0.0.exe` - Installer
- `Timezone Converter 1.0.0.exe` - Portable executable

### macOS
- `Timezone Converter-1.0.0.dmg` - Disk image

### Linux
- `Timezone Converter-1.0.0.AppImage` - Portable executable

## Notes

- The app is configured to disable GPU acceleration for WSL compatibility
- Default keybind is `Cmd/Ctrl+Shift+[` (configurable in settings)
- Settings are stored in `~/.timezone-converter-settings.json`
- No Node.js installation required for end users - executables are self-contained