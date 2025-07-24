# Timezone Converter

A cross-platform desktop timezone converter built with Electron. Features a modern UI with real-time timezone display and customizable settings.

## Features

- **Time Conversion**: Convert time between any two timezones
- **World Clock**: Real-time display of current times in multiple timezones
- **Customizable Settings**: 
  - Configure global keybindings
  - Select which timezones to display
- **Modern UI**: Clean, dark-themed interface with rectangular layout
- **Cross-Platform**: Runs on Windows, macOS, and Linux
- **WSL Compatible**: GPU acceleration disabled for seamless WSL operation

## Screenshots

The app features a split-panel design:
- Left panel: Time conversion controls
- Right panel: Live world clock display
- Settings page: Keybinding and timezone configuration

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Fiction000/timezone-converter.git
   cd timezone-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

4. Start the application:
   ```bash
   npm start
   ```

### Development
For development with hot reload:
```bash
npm run dev
```

## Usage

### Time Conversion
1. Select the source timezone from the first dropdown
2. Enter the time you want to convert
3. Select the target timezone from the second dropdown
4. The converted time will be displayed below

### World Clock
The right panel shows current times for selected timezones in a grid layout. Times update every second.

### Settings
Click the "Settings" button to access configuration options:

#### Keybindings
- **Toggle Window**: Configure the global hotkey to show/hide the application
- Default: `CommandOrControl+Shift+T`
- Click "Change" and press your desired key combination

#### Visible Timezones
- Check/uncheck timezones to customize which ones appear in the world clock
- Changes are saved automatically and applied immediately

### Global Hotkey
The application runs in the background and can be toggled with the configured hotkey (default: Ctrl+Shift+T on Windows/Linux, Cmd+Shift+T on macOS).

## Supported Timezones

The application includes major timezones:
- **Americas**: New York, Los Angeles, Chicago
- **Europe**: London, Paris, Berlin  
- **Asia**: Tokyo, Shanghai, Dubai
- **Oceania**: Sydney

## Technical Details

### Built With
- **Electron**: Desktop application framework
- **TypeScript**: Type-safe JavaScript
- **Moment.js**: Timezone calculations and formatting
- **HTML/CSS**: Modern dark-themed UI

### Architecture
- Main process: `src/main.ts` - Electron main process, window management
- Renderer: `renderer/` - UI and application logic
- Settings: Stored in localStorage with real-time sync

### WSL Compatibility
The application includes several GPU acceleration disabling flags for smooth operation in WSL environments:
- Hardware acceleration disabled
- GPU process disabled
- Software rasterizer disabled
- Sandbox disabled for WSL compatibility

## Development

### Project Structure
```
timezone-converter/
├── src/
│   └── main.ts          # Main Electron process
├── renderer/
│   ├── index.html       # UI markup
│   └── renderer.js      # UI logic and settings
├── assets/
│   └── icon.png         # Application icon
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

### Scripts
- `npm run build` - Compile TypeScript
- `npm start` - Build and run the application
- `npm run dev` - Development mode (compile + run)

### Adding Timezones
To add new timezones, update the `majorTimezones` array in `renderer/renderer.js` and add corresponding checkboxes in the settings HTML.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Timezone data from [Moment.js](https://momentjs.com/)
- Created with assistance from [Claude Code](https://claude.ai/code)