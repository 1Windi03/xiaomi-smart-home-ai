require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-mode'
});

// Simulated smart home devices
let devices = {
  'living-room-light': { name: 'Living Room Light', type: 'light', status: 'off', brightness: 0, room: 'living-room' },
  'bedroom-light': { name: 'Bedroom Light', type: 'light', status: 'off', brightness: 0, room: 'bedroom' },
  'kitchen-light': { name: 'Kitchen Light', type: 'light', status: 'off', brightness: 0, room: 'kitchen' },
  'living-room-ac': { name: 'Living Room AC', type: 'ac', status: 'off', temperature: 24, room: 'living-room' },
  'bedroom-fan': { name: 'Bedroom Fan', type: 'fan', status: 'off', speed: 0, room: 'bedroom' },
  'front-door-lock': { name: 'Front Door Lock', type: 'lock', status: 'locked', room: 'entrance' },
  'garage-door': { name: 'Garage Door', type: 'door', status: 'closed', room: 'garage' },
  'security-camera': { name: 'Security Camera', type: 'camera', status: 'on', recording: true, room: 'entrance' }
};

// Energy usage tracking
let energyData = [];
let commandHistory = [];

// Middleware
app.use(express.json());
app.use(express.static('public'));

// WebSocket server
const server = app.listen(PORT, () => {
  console.log(`🏠 Smart Home AI Dashboard running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

// Broadcast to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// AI Command Processing
async function processCommand(command) {
  const isDemoMode = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-mode';
  
  if (isDemoMode) {
    return processDemoCommand(command);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a smart home assistant. Parse user commands and return JSON with device actions.
Available devices: ${Object.keys(devices).join(', ')}
Device types: light (on/off/brightness 0-100), ac (on/off/temp 16-30), fan (on/off/speed 0-3), lock (locked/unlocked), door (open/closed), camera (on/off/recording true/false)

Return JSON format:
{
  "actions": [{"device": "device-id", "command": "on/off/set", "value": value}],
  "response": "natural language response"
}

Examples:
"turn on living room light" -> {"actions": [{"device": "living-room-light", "command": "on"}], "response": "Living room light turned on"}
"set bedroom light to 50%" -> {"actions": [{"device": "bedroom-light", "command": "set", "value": 50}], "response": "Bedroom light set to 50%"}
"lock all doors" -> {"actions": [{"device": "front-door-lock", "command": "locked"}], "response": "Front door locked"}`
        },
        {
          role: "user",
          content: command
        }
      ],
      temperature: 0.3
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    return processDemoCommand(command);
  }
}

// Demo mode command processing (fallback)
function processDemoCommand(command) {
  const cmd = command.toLowerCase();
  const actions = [];
  let response = "Command processed";

  // Simple pattern matching for demo
  if (cmd.includes('turn on') || cmd.includes('nyalakan')) {
    Object.keys(devices).forEach(id => {
      if (cmd.includes(devices[id].name.toLowerCase()) || cmd.includes(devices[id].room)) {
        actions.push({ device: id, command: 'on' });
        response = `${devices[id].name} turned on`;
      }
    });
  } else if (cmd.includes('turn off') || cmd.includes('matikan')) {
    Object.keys(devices).forEach(id => {
      if (cmd.includes(devices[id].name.toLowerCase()) || cmd.includes(devices[id].room)) {
        actions.push({ device: id, command: 'off' });
        response = `${devices[id].name} turned off`;
      }
    });
  } else if (cmd.includes('all lights')) {
    Object.keys(devices).forEach(id => {
      if (devices[id].type === 'light') {
        actions.push({ device: id, command: cmd.includes('off') ? 'off' : 'on' });
      }
    });
    response = `All lights turned ${cmd.includes('off') ? 'off' : 'on'}`;
  }

  if (actions.length === 0) {
    response = "Sorry, I couldn't understand that command. Try 'turn on living room light' or 'turn off all lights'";
  }

  return { actions, response };
}

// Execute device actions
function executeActions(actions) {
  const results = [];
  
  actions.forEach(action => {
    const device = devices[action.device];
    if (!device) return;

    switch (action.command) {
      case 'on':
        device.status = 'on';
        if (device.type === 'light') device.brightness = 100;
        if (device.type === 'fan') device.speed = 2;
        break;
      case 'off':
        device.status = 'off';
        if (device.type === 'light') device.brightness = 0;
        if (device.type === 'fan') device.speed = 0;
        break;
      case 'set':
        if (device.type === 'light') {
          device.brightness = action.value;
          device.status = action.value > 0 ? 'on' : 'off';
        } else if (device.type === 'ac') {
          device.temperature = action.value;
        } else if (device.type === 'fan') {
          device.speed = action.value;
        }
        break;
      case 'locked':
      case 'unlocked':
        device.status = action.command;
        break;
      case 'open':
      case 'closed':
        device.status = action.command;
        break;
    }

    results.push({ device: action.device, success: true });
    
    // Track energy usage
    if (device.status === 'on') {
      energyData.push({
        timestamp: Date.now(),
        device: device.name,
        type: device.type,
        power: device.type === 'light' ? device.brightness * 0.1 : 
               device.type === 'ac' ? 1500 : 
               device.type === 'fan' ? device.speed * 50 : 10
      });
    }
  });

  return results;
}

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send initial state
  ws.send(JSON.stringify({
    type: 'init',
    devices,
    energyData: energyData.slice(-50),
    commandHistory: commandHistory.slice(-10)
  }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'command') {
        const command = data.command;
        
        // Process with AI
        const result = await processCommand(command);
        
        // Execute actions
        const execResults = executeActions(result.actions);
        
        // Log command
        commandHistory.push({
          timestamp: Date.now(),
          command,
          response: result.response,
          success: execResults.length > 0
        });

        // Broadcast updates
        broadcast({
          type: 'update',
          devices,
          response: result.response,
          commandHistory: commandHistory.slice(-10)
        });
      } else if (data.type === 'manual') {
        // Manual device control
        const device = devices[data.device];
        if (device) {
          Object.assign(device, data.changes);
          broadcast({
            type: 'update',
            devices
          });
        }
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// REST API endpoints
app.get('/api/devices', (req, res) => {
  res.json(devices);
});

app.get('/api/energy', (req, res) => {
  res.json(energyData.slice(-100));
});

app.get('/api/history', (req, res) => {
  res.json(commandHistory.slice(-20));
});

app.post('/api/reset', (req, res) => {
  // Reset all devices
  Object.keys(devices).forEach(id => {
    const device = devices[id];
    device.status = device.type === 'lock' ? 'locked' : 
                    device.type === 'door' ? 'closed' : 
                    device.type === 'camera' ? 'on' : 'off';
    if (device.brightness !== undefined) device.brightness = 0;
    if (device.speed !== undefined) device.speed = 0;
  });
  
  energyData = [];
  commandHistory = [];
  
  broadcast({ type: 'update', devices });
  res.json({ success: true });
});
