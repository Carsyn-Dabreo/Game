# CyberGrid - Cybersecurity Training Simulation

A high-fidelity 3D cybersecurity training simulation built with Vanilla JavaScript and Three.js.

## 🏗️ Architecture

```
Frontend (Vanilla JS + Three.js)
        ↓
Visuals (WebGL / Post-processing)
        ↓
Logic (Custom Physics + Task Engine)
```

## 🚀 Features

- **Immersive 3D Environment**: Explore a futuristic neon city built with Three.js.
- **Cybersecurity Challenges**: Solve complex multiple-choice questions on network security, application security, and cryptography.
- **Dynamic Minimap**: Real-time tracking of secured systems and your current position.
- **Responsive Controls**: Smooth third-person movement with world-boundary constraints.
- **Post-processing**: Advanced Bloom and ToneMapping for a premium aesthetic.

## 📋 Prerequisites

- **Node.js** 18+ 

## 🛠️ Quick Start

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Open in Browser**
Navigate to `http://localhost:5173/`

## 🎮 Game Controls

- **WASD**: Movement
- **Shift**: Sprint
- **Space**: Jump
- **Right Click + Mouse**: Rotate Camera
- **E**: Interact with Secure Nodes
- **Click Minimap**: View Full City Grid

## 🔧 Project Structure

```
├── src/
│   ├── engine/         # Core game logic (Player, World, Tasks)
│   ├── ui/             # UI Management
│   ├── services/       # API & Socket.IO layer
│   └── main.js         # Entry point
├── public/
│   └── models/         # 3D Assets (.glb)
├── style.css           # Global styles and UI themes
└── index.html          # Main container
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for cybersecurity education**
