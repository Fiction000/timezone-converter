# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run build` - Compile TypeScript code to JavaScript in the `dist/` directory
- `npm start` - Build and run the Electron application
- `npm run dev` - Quick development mode (compile TypeScript and run Electron)
- `npm test` - Currently not implemented (placeholder script)

## Architecture Overview

This is an Electron desktop application for timezone conversion with a two-panel design:

### Main Process (`src/main.ts`)
- **TimezoneConverterApp class**: Main application controller
- **Window Management**: Creates frameless, always-on-top window (800x400) that hides on blur
- **Global Shortcuts**: Registers `CommandOrControl+Shift+T` to toggle window visibility
- **System Tray**: Provides tray icon with context menu for show/quit actions
- **WSL Compatibility**: Disables GPU acceleration and hardware rendering for WSL environments

### Renderer Process (`renderer/`)
- **HTML UI** (`index.html`): Split-panel layout with navigation tabs
- **JavaScript Logic** (`renderer.js`): Contains `TimezoneConverter` class and settings management
- **Two Main Views**:
  - Main panel: Time conversion between any two timezones
  - World Clock: Real-time display of current times in selected timezones

### Key Components

**TimezoneConverter Class** (`renderer/renderer.js:3-126`):
- Manages time conversion logic using moment-timezone
- Updates world clock display every second
- Handles timezone visibility based on user settings stored in localStorage

**Settings System** (`renderer/renderer.js:159-262`):
- Keybinding configuration with real-time key capture
- Timezone visibility toggles with checkboxes
- Settings persisted in localStorage with automatic sync

**Major Timezones Array** (`renderer/renderer.js:5-16`):
Predefined list of 10 major world timezones covering Americas, Europe, Asia, and Oceania.

## Technical Details

- **Framework**: Electron with TypeScript compilation
- **Timezone Library**: moment-timezone for calculations and formatting
- **Security Settings**: nodeIntegration enabled, contextIsolation disabled for simple renderer communication
- **Build Output**: TypeScript compiles from `src/` to `dist/` directory
- **Node Integration**: Enabled in renderer for direct node module access

## Adding New Timezones

To add timezones, update the `majorTimezones` array in `renderer/renderer.js:5-16` and add corresponding checkboxes in the settings HTML section.