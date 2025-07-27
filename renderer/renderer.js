const moment = require('moment-timezone');

// Safe IPC renderer access
let ipcRenderer = null;
try {
    ipcRenderer = require('electron').ipcRenderer;
} catch (error) {
    console.error('IPC not available:', error);
}

class TimezoneConverter {
    constructor() {
        this.majorTimezones = [
            { name: 'New York', zone: 'America/New_York' },
            { name: 'Los Angeles', zone: 'America/Los_Angeles' },
            { name: 'Chicago', zone: 'America/Chicago' },
            { name: 'London', zone: 'Europe/London' },
            { name: 'Paris', zone: 'Europe/Paris' },
            { name: 'Berlin', zone: 'Europe/Berlin' },
            { name: 'Tokyo', zone: 'Asia/Tokyo' },
            { name: 'Shanghai', zone: 'Asia/Shanghai' },
            { name: 'Dubai', zone: 'Asia/Dubai' },
            { name: 'Sydney', zone: 'Australia/Sydney' }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentTimes();
        this.startClockUpdate();
        this.convertTime();
    }

    setupEventListeners() {
        const dateInput = document.getElementById('dateInput');
        const timeInput = document.getElementById('timeInput');
        const fromTimezone = document.getElementById('fromTimezone');
        const toTimezone = document.getElementById('toTimezone');

        dateInput.addEventListener('change', () => this.convertTime());
        timeInput.addEventListener('change', () => this.convertTime());
        fromTimezone.addEventListener('change', () => this.convertTime());
        toTimezone.addEventListener('change', () => this.convertTime());

        // Set current date and time as default
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        const currentTime = now.toTimeString().substr(0, 5);
        dateInput.value = currentDate;
        timeInput.value = currentTime;
    }

    convertTime() {
        const dateInput = document.getElementById('dateInput').value;
        const timeInput = document.getElementById('timeInput').value;
        const fromTimezone = document.getElementById('fromTimezone').value;
        const toTimezone = document.getElementById('toTimezone').value;
        const resultDiv = document.getElementById('conversionResult');

        if (!dateInput || !timeInput) {
            resultDiv.textContent = 'Please select a date and time';
            return;
        }

        try {
            const [hours, minutes] = timeInput.split(':');
            
            // Create a moment object with the selected date and time in the source timezone
            const sourceTime = moment.tz(`${dateInput} ${timeInput}`, 'YYYY-MM-DD HH:mm', fromTimezone);

            const convertedTime = sourceTime.clone().tz(toTimezone);

            const fromName = this.getTimezoneDisplayName(fromTimezone);
            const toName = this.getTimezoneDisplayName(toTimezone);

            resultDiv.innerHTML = `
                <div style="margin-bottom: 8px;">
                    <strong>${fromName}:</strong> ${sourceTime.format('h:mm A')} (${sourceTime.format('MMM D, YYYY')})
                </div>
                <div>
                    <strong>${toName}:</strong> ${convertedTime.format('h:mm A')} (${convertedTime.format('MMM D, YYYY')})
                </div>
            `;
        } catch (error) {
            resultDiv.textContent = 'Error converting time';
        }
    }

    updateCurrentTimes() {
        const displayDiv = document.getElementById('timezoneDisplay');
        displayDiv.innerHTML = '';

        const visibleTimezones = this.getVisibleTimezones();
        
        visibleTimezones.forEach(tz => {
            const currentTime = moment.tz(tz.zone);
            const timeDiv = document.createElement('div');
            timeDiv.className = 'timezone-item';
            
            timeDiv.innerHTML = `
                <span class="timezone-name">${tz.name}</span>
                <span class="timezone-time">${currentTime.format('h:mm A')}</span>
            `;
            
            displayDiv.appendChild(timeDiv);
        });
    }

    getVisibleTimezones() {
        const settings = JSON.parse(localStorage.getItem('timezoneConverterSettings') || '{}');
        
        if (settings.visibleTimezones && settings.visibleTimezones.length > 0) {
            return settings.visibleTimezones.map(tz => ({
                name: tz.name,
                zone: tz.zone
            }));
        }
        
        return this.majorTimezones;
    }

    updateVisibleTimezones() {
        this.updateCurrentTimes();
    }

    getTimezoneDisplayName(zone) {
        const timezone = this.majorTimezones.find(tz => tz.zone === zone);
        return timezone ? timezone.name : zone;
    }

    startClockUpdate() {
        setInterval(() => {
            this.updateCurrentTimes();
        }, 1000);
    }
}

// Page navigation functions
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page, .settings-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    if (pageName === 'main') {
        document.getElementById('main-page').classList.add('active');
    } else if (pageName === 'settings') {
        document.getElementById('settings-page').classList.add('active');
    }
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (pageName === 'main') {
        document.querySelector('.nav-btn[onclick*="main"]').classList.add('active');
    } else if (pageName === 'settings') {
        document.querySelector('.nav-btn[onclick*="settings"]').classList.add('active');
    }
}

// Settings management
let isRecordingKeybind = false;
let currentKeybindInput = null;

// Function to format keybinds for display
function formatKeybindForDisplay(keybind) {
    if (!keybind) return 'Cmd/Ctrl+Shift+[';
    return keybind.replace('CommandOrControl', 'Cmd/Ctrl');
}

// Function to format keybinds for internal use
function formatKeybindForInternal(keybind) {
    if (!keybind) return 'CommandOrControl+Shift+[';
    return keybind.replace('Cmd/Ctrl', 'CommandOrControl');
}

function recordKeybind(inputId) {
    if (isRecordingKeybind) return;
    
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    isRecordingKeybind = true;
    currentKeybindInput = input;
    
    input.value = 'Press keys...';
    button.textContent = 'Recording...';
    button.disabled = true;
    
    // Listen for keypress
    document.addEventListener('keydown', captureKeybind);
}

function captureKeybind(event) {
    if (!isRecordingKeybind) return;
    
    event.preventDefault();
    
    // Allow Escape to cancel recording
    if (event.key === 'Escape') {
        cancelKeybindRecording();
        return;
    }
    
    const keys = [];
    if (event.ctrlKey || event.metaKey) keys.push('CommandOrControl');
    if (event.shiftKey) keys.push('Shift');
    if (event.altKey) keys.push('Alt');
    
    // Only add the key if it's not a modifier key and has a meaningful value
    let regularKey = null;
    if (event.key !== 'Control' && event.key !== 'Shift' && event.key !== 'Alt' && event.key !== 'Meta' && event.key.length > 0) {
        regularKey = event.key.toUpperCase();
        keys.push(regularKey);
    }
    
    // Only proceed if we have at least one modifier AND one regular key
    const hasModifier = keys.some(k => ['CommandOrControl', 'Shift', 'Alt'].includes(k));
    const hasRegularKey = regularKey !== null;
    
    if (hasModifier && hasRegularKey && keys.length >= 2) {
        const keybind = keys.join('+');
        
        // Double-check the keybind format is valid
        const parts = keybind.split('+');
        const modifiers = parts.filter(p => ['CommandOrControl', 'Shift', 'Alt'].includes(p));
        const regularKeys = parts.filter(p => !['CommandOrControl', 'Shift', 'Alt'].includes(p));
        
        if (modifiers.length >= 1 && regularKeys.length >= 1) {
            console.log('Valid keybind captured:', keybind);
            currentKeybindInput.value = keybind;
            
            // Save to settings
            saveSettings();
            
            // Update the actual keybind in main process
            console.log('Sending keybind to main process:', keybind);
            if (ipcRenderer) {
                ipcRenderer.send('update-keybind', keybind);
            } else {
                console.error('IPC not available, cannot send keybind update');
            }
            
            // Reset recording state only after successful capture
            finishKeybindRecording();
        } else {
            console.log('Incomplete keybind, continue recording. Current keys:', keys);
        }
    } else {
        console.log('Waiting for complete keybind. Has modifier:', hasModifier, 'Has regular key:', hasRegularKey, 'Keys:', keys);
    }
    // Don't reset if we don't have a valid keybind yet - keep recording
}

function cancelKeybindRecording() {
    if (!isRecordingKeybind) return;
    
    // Restore original value
    const settings = JSON.parse(localStorage.getItem('timezoneConverterSettings') || '{}');
    currentKeybindInput.value = settings.keybinds?.toggle || 'CommandOrControl+Shift+[';
    
    finishKeybindRecording();
}

function finishKeybindRecording() {
    isRecordingKeybind = false;
    const button = currentKeybindInput.nextElementSibling;
    button.textContent = 'Change';
    button.disabled = false;
    currentKeybindInput = null;
    
    document.removeEventListener('keydown', captureKeybind);
}

function saveSettings() {
    const displayValue = document.getElementById('toggleKeybind').value;
    const internalValue = formatKeybindForInternal(displayValue);
    
    const settings = {
        keybinds: {
            toggle: internalValue
        },
        visibleTimezones: []
    };
    
    // Get checked timezones
    const checkedBoxes = document.querySelectorAll('#timezoneList input[type="checkbox"]:checked');
    
    // Direct mapping based on known checkbox IDs
    checkedBoxes.forEach(checkbox => {
        const checkboxId = checkbox.id.replace('tz-', '');
        
        const zoneMap = {
            'america-new_york': 'America/New_York',
            'america-los_angeles': 'America/Los_Angeles', 
            'america-chicago': 'America/Chicago',
            'europe-london': 'Europe/London',
            'europe-paris': 'Europe/Paris',
            'europe-berlin': 'Europe/Berlin',
            'asia-tokyo': 'Asia/Tokyo',
            'asia-shanghai': 'Asia/Shanghai',
            'asia-dubai': 'Asia/Dubai',
            'australia-sydney': 'Australia/Sydney'
        };
        
        const zone = zoneMap[checkboxId];
        if (zone) {
            const timezone = window.timezoneConverter.majorTimezones.find(tz => tz.zone === zone);
            if (timezone) {
                settings.visibleTimezones.push({
                    id: timezone.zone,
                    name: timezone.name,
                    zone: timezone.zone
                });
            }
        }
    });
    
    localStorage.setItem('timezoneConverterSettings', JSON.stringify(settings));
    
    // Update the display
    if (window.timezoneConverter) {
        window.timezoneConverter.updateCurrentTimes();
    }
}

// Load settings on page load
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('timezoneConverterSettings') || '{}');
    
    if (settings.keybinds?.toggle) {
        document.getElementById('toggleKeybind').value = formatKeybindForDisplay(settings.keybinds.toggle);
    } else {
        document.getElementById('toggleKeybind').value = formatKeybindForDisplay('CommandOrControl+Shift+[');
    }
    
    if (settings.visibleTimezones) {
        // Uncheck all first
        document.querySelectorAll('#timezoneList input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Check saved ones
        settings.visibleTimezones.forEach(tz => {
            // Convert timezone zone to checkbox ID format
            const checkboxId = `tz-${tz.id.toLowerCase().replace(/\//g, '-').replace(/_/g, '_')}`;
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.timezoneConverter = new TimezoneConverter();
    loadSettings();
    
    // Add event listeners to timezone checkboxes
    document.querySelectorAll('#timezoneList input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', saveSettings);
    });
    
    // IPC listeners
    if (ipcRenderer) {
        ipcRenderer.on('keybind-updated', (event, result) => {
            if (!result.success) {
                alert('Failed to update keybind: ' + (result.error || 'Unknown error'));
            }
        });
        
        ipcRenderer.on('current-keybind', (event, keybind) => {
            document.getElementById('toggleKeybind').value = formatKeybindForDisplay(keybind);
        });
    } else {
        console.warn('IPC not available, keybind updates will not work');
    }
});