# 🎬 Demo Guide

## Quick Start Demo

1. **Open the dashboard:** http://localhost:3000

2. **Try these commands:**

### Text Commands
```
turn on living room light
set bedroom light to 75%
turn off all lights
lock front door
set living room AC to 22 degrees
turn on bedroom fan
```

### Voice Commands
- Click the 🎤 microphone button
- Say: "turn on kitchen light"
- Watch it execute automatically

### Manual Control
- Click any device card
- Use On/Off buttons
- Adjust sliders for brightness/temperature/speed

## Features Showcase

### 1. Natural Language AI
The system understands variations:
- "turn on the light in the living room"
- "living room light on"
- "switch on living room lamp"

### 2. Bulk Operations
- "turn off all lights"
- "lock all doors"
- "turn off everything"

### 3. Real-time Updates
- Open dashboard in 2 browser tabs
- Control device in one tab
- See instant update in the other tab

### 4. Energy Monitoring
Watch the power usage stat update as you turn devices on/off.

### 5. Command History
All commands are logged with timestamps in the sidebar.

## Demo Mode

Works without OpenAI API key using pattern matching for common commands.

For full AI capabilities, add your OpenAI key to `.env`:
```
OPENAI_API_KEY=sk-...
```

## Screenshots

### Main Dashboard
- 8 simulated smart home devices
- Real-time status indicators
- Energy consumption tracking

### Command Interface
- Text input with natural language
- Voice command button
- Quick action shortcuts

### Device Controls
- Individual device cards
- Manual on/off controls
- Sliders for adjustable parameters

---

**Live Demo:** http://localhost:3000  
**Repository:** https://github.com/1Windi03/xiaomi-smart-home-ai
