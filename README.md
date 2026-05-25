# 🏠 AI Smart Home Dashboard

AI-powered smart home control dashboard with natural language processing. Control your smart home devices using voice commands or text input.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

## ✨ Features

- 🗣️ **Natural Language Control** - Control devices with plain English commands
- 🎤 **Voice Commands** - Hands-free control using Web Speech API
- 📊 **Real-time Dashboard** - Live device status and energy monitoring
- 🤖 **AI-Powered** - OpenAI GPT integration for intelligent command parsing
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **WebSocket Communication** - Real-time updates across all clients
- 🎨 **Modern UI** - Dark theme with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- OpenAI API key (optional - works in demo mode without it)

### Installation

```bash
# Clone the repository
git clone https://github.com/TiusLauren/xiaomi-smart-home-ai.git
cd xiaomi-smart-home-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your OpenAI API key (optional)
# OPENAI_API_KEY=your_key_here

# Start the server
npm start
```

The dashboard will be available at `http://localhost:3000`

## 🎮 Usage

### Text Commands

Type natural language commands in the input field:

- "turn on living room light"
- "set bedroom light to 50%"
- "turn off all lights"
- "lock all doors"
- "set AC temperature to 22 degrees"

### Voice Commands

Click the microphone button and speak your command. The system will automatically process it.

### Manual Control

Click on individual device cards to control them manually with on/off buttons and sliders.

## 🏗️ Architecture

```
xiaomi-smart-home-ai/
├── server.js           # Express + WebSocket server
├── public/
│   ├── index.html      # Main dashboard UI
│   ├── app.js          # Frontend WebSocket client
│   └── style.css       # Styling
├── package.json
├── .env.example
└── README.md
```

### Tech Stack

- **Backend**: Node.js, Express, WebSocket (ws)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI**: OpenAI GPT-3.5 Turbo
- **Real-time**: WebSocket for bidirectional communication

## 🔧 Configuration

### Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here  # Optional - demo mode works without it
PORT=3000                                 # Server port
```

### Demo Mode

The app works without an OpenAI API key using pattern matching for common commands. For full AI capabilities, add your OpenAI API key to `.env`.

## 📱 Supported Devices

- 💡 **Lights** - On/Off, Brightness control (0-100%)
- ❄️ **Air Conditioners** - On/Off, Temperature (16-30°C)
- 🌀 **Fans** - On/Off, Speed control (0-3)
- 🔒 **Locks** - Lock/Unlock
- 🚪 **Doors** - Open/Close
- 📹 **Cameras** - On/Off, Recording status

## 🎯 Example Commands

```
"turn on living room light"
"set bedroom light to 75%"
"turn off all lights"
"lock front door"
"open garage door"
"set living room AC to 22 degrees"
"turn on bedroom fan at speed 2"
"turn off everything"
```

## 🔒 Security

- All device operations are simulated (no real hardware control)
- WebSocket connections are local by default
- For production use, implement authentication and HTTPS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🏆 Xiaomi MiMo 100T Creator Program

This project is submitted for the Xiaomi MiMo 100T Creator Program, showcasing AI-powered smart home automation.

## 👨‍💻 Author

**TiusLauren**
- GitHub: [@TiusLauren](https://github.com/TiusLauren)

## 🙏 Acknowledgments

- OpenAI for GPT API
- Xiaomi MiMo 100T Creator Program
- Open source community

---

Built with ❤️ for the Xiaomi MiMo 100T Creator Program
