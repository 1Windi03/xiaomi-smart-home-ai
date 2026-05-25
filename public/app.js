let ws;
let devices = {};
let commandHistory = [];
let recognition;

// Initialize WebSocket connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
        console.log('Connected to server');
        updateConnectionStatus(true);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch(data.type) {
            case 'init':
                devices = data.devices;
                commandHistory = data.commandHistory || [];
                renderDevices();
                renderHistory();
                updateStats();
                break;
            case 'update':
                devices = data.devices;
                if (data.response) {
                    showResponse(data.response);
                }
                if (data.commandHistory) {
                    commandHistory = data.commandHistory;
                    renderHistory();
                }
                renderDevices();
                updateStats();
                break;
            case 'error':
                showResponse('Error: ' + data.message, true);
                break;
        }
    };

    ws.onclose = () => {
        console.log('Disconnected from server');
        updateConnectionStatus(false);
        setTimeout(initWebSocket, 3000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('securityStatus');
    if (statusEl) {
        statusEl.textContent = connected ? 'Connected' : 'Offline';
    }
}

// Send command
function sendCommand(command) {
    if (!command.trim()) return;
    
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'command',
            command: command
        }));
        document.getElementById('commandInput').value = '';
        showResponse('Processing...', false, true);
    } else {
        showResponse('Not connected to server', true);
    }
}

// Show response
function showResponse(message, isError = false, isLoading = false) {
    const responseEl = document.getElementById('response');
    responseEl.textContent = message;
    responseEl.className = 'response';
    
    if (!isLoading) {
        responseEl.classList.add('active');
    }
    
    if (isError) {
        responseEl.style.borderLeftColor = 'var(--danger)';
    }
}

// Render devices
function renderDevices() {
    const container = document.getElementById('devicesList');
    container.innerHTML = '';

    Object.keys(devices).forEach(id => {
        const device = devices[id];
        const card = document.createElement('div');
        card.className = `device-card ${device.status === 'on' || device.status === 'unlocked' || device.status === 'open' ? 'active' : ''}`;
        
        const icon = getDeviceIcon(device.type, device.status);
        const statusClass = device.status === 'on' || device.status === 'unlocked' || device.status === 'open' ? 'on' : 
                           device.status === 'locked' || device.status === 'closed' ? 'locked' : 'off';
        
        let controls = '';
        
        if (device.type === 'light') {
            controls = `
                <div class="device-controls">
                    <button class="btn-on" onclick="toggleDevice('${id}', 'on')">On</button>
                    <button class="btn-off" onclick="toggleDevice('${id}', 'off')">Off</button>
                </div>
                <div class="slider-control">
                    <label>Brightness: ${device.brightness}%</label>
                    <input type="range" min="0" max="100" value="${device.brightness}" 
                           onchange="setBrightness('${id}', this.value)">
                </div>
            `;
        } else if (device.type === 'ac') {
            controls = `
                <div class="device-controls">
                    <button class="btn-on" onclick="toggleDevice('${id}', 'on')">On</button>
                    <button class="btn-off" onclick="toggleDevice('${id}', 'off')">Off</button>
                </div>
                <div class="slider-control">
                    <label>Temperature: ${device.temperature}°C</label>
                    <input type="range" min="16" max="30" value="${device.temperature}" 
                           onchange="setTemperature('${id}', this.value)">
                </div>
            `;
        } else if (device.type === 'fan') {
            controls = `
                <div class="device-controls">
                    <button class="btn-on" onclick="toggleDevice('${id}', 'on')">On</button>
                    <button class="btn-off" onclick="toggleDevice('${id}', 'off')">Off</button>
                </div>
                <div class="slider-control">
                    <label>Speed: ${device.speed}</label>
                    <input type="range" min="0" max="3" value="${device.speed}" 
                           onchange="setSpeed('${id}', this.value)">
                </div>
            `;
        } else if (device.type === 'lock') {
            controls = `
                <div class="device-controls">
                    <button class="btn-on" onclick="toggleDevice('${id}', 'locked')">Lock</button>
                    <button class="btn-off" onclick="toggleDevice('${id}', 'unlocked')">Unlock</button>
                </div>
            `;
        } else if (device.type === 'door') {
            controls = `
                <div class="device-controls">
                    <button class="btn-on" onclick="toggleDevice('${id}', 'open')">Open</button>
                    <button class="btn-off" onclick="toggleDevice('${id}', 'closed')">Close</button>
                </div>
            `;
        } else {
            controls = `
                <div class="device-controls">
                    <button class="btn-on" onclick="toggleDevice('${id}', 'on')">On</button>
                    <button class="btn-off" onclick="toggleDevice('${id}', 'off')">Off</button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="device-header">
                <div class="device-icon">${icon}</div>
                <span class="device-status ${statusClass}">${device.status.toUpperCase()}</span>
            </div>
            <div class="device-name">${device.name}</div>
            <div class="device-room">${device.room.replace('-', ' ')}</div>
            ${controls}
        `;
        
        container.appendChild(card);
    });
}

function getDeviceIcon(type, status) {
    const icons = {
        light: status === 'on' ? '💡' : '🔦',
        ac: '❄️',
        fan: '🌀',
        lock: status === 'locked' ? '🔒' : '🔓',
        door: status === 'closed' ? '🚪' : '🚪',
        camera: '📹'
    };
    return icons[type] || '📱';
}

// Device controls
function toggleDevice(deviceId, command) {
    if (ws.readyState === WebSocket.OPEN) {
        const device = devices[deviceId];
        const changes = { status: command };
        
        if (command === 'on' && device.type === 'light') {
            changes.brightness = 100;
        } else if (command === 'off' && device.type === 'light') {
            changes.brightness = 0;
        }
        
        ws.send(JSON.stringify({
            type: 'manual',
            device: deviceId,
            changes
        }));
    }
}

function setBrightness(deviceId, value) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'manual',
            device: deviceId,
            changes: {
                brightness: parseInt(value),
                status: parseInt(value) > 0 ? 'on' : 'off'
            }
        }));
    }
}

function setTemperature(deviceId, value) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'manual',
            device: deviceId,
            changes: { temperature: parseInt(value) }
        }));
    }
}

function setSpeed(deviceId, value) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'manual',
            device: deviceId,
            changes: {
                speed: parseInt(value),
                status: parseInt(value) > 0 ? 'on' : 'off'
            }
        }));
    }
}

// Render command history
function renderHistory() {
    const container = document.getElementById('commandHistory');
    container.innerHTML = '';

    if (commandHistory.length === 0) {
        container.innerHTML = '<p style="color: var(--text-dim); text-align: center;">No commands yet</p>';
        return;
    }

    commandHistory.slice().reverse().forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const time = new Date(item.timestamp).toLocaleTimeString();
        
        historyItem.innerHTML = `
            <div class="history-time">${time}</div>
            <div class="history-command">${item.command}</div>
            <div class="history-response">${item.response}</div>
        `;
        
        container.appendChild(historyItem);
    });
}

// Update stats
function updateStats() {
    const activeCount = Object.values(devices).filter(d => 
        d.status === 'on' || d.status === 'unlocked' || d.status === 'open'
    ).length;
    
    const powerUsage = Object.values(devices).reduce((total, device) => {
        if (device.status === 'on') {
            if (device.type === 'light') return total + (device.brightness * 0.1);
            if (device.type === 'ac') return total + 1500;
            if (device.type === 'fan') return total + (device.speed * 50);
            return total + 10;
        }
        return total;
    }, 0);
    
    document.getElementById('activeDevices').textContent = activeCount;
    document.getElementById('powerUsage').textContent = Math.round(powerUsage) + 'W';
    document.getElementById('commandCount').textContent = commandHistory.length;
    
    const allLocked = Object.values(devices)
        .filter(d => d.type === 'lock')
        .every(d => d.status === 'locked');
    document.getElementById('securityStatus').textContent = allLocked ? 'Secure' : 'Alert';
}

// Voice recognition
function initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('commandInput').value = transcript;
            sendCommand(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            showResponse('Voice recognition error: ' + event.error, true);
            document.getElementById('voiceBtn').classList.remove('listening');
        };

        recognition.onend = () => {
            document.getElementById('voiceBtn').classList.remove('listening');
        };
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initWebSocket();
    initVoiceRecognition();

    document.getElementById('sendBtn').addEventListener('click', () => {
        const command = document.getElementById('commandInput').value;
        sendCommand(command);
    });

    document.getElementById('commandInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const command = document.getElementById('commandInput').value;
            sendCommand(command);
        }
    });

    document.getElementById('voiceBtn').addEventListener('click', () => {
        if (recognition) {
            const btn = document.getElementById('voiceBtn');
            if (btn.classList.contains('listening')) {
                recognition.stop();
                btn.classList.remove('listening');
            } else {
                recognition.start();
                btn.classList.add('listening');
                showResponse('Listening...', false, true);
            }
        } else {
            showResponse('Voice recognition not supported in this browser', true);
        }
    });

    // Quick action buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const command = btn.getAttribute('data-cmd');
            document.getElementById('commandInput').value = command;
            sendCommand(command);
        });
    });
});
