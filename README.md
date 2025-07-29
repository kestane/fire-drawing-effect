# 🔥 Fire Drawing Effect

An interactive drawing application with elemental particle effects and ambient music. Create beautiful fire, ice, lightning, and other magical effects with your mouse or touch input.

![Fire Drawing Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-19-blue)

## ✨ Features

### 🎨 Drawing Effects
- **Fire** 🔥 - Surfing fire particles that follow your cursor movement
- **Ice** ❄️ - Crystalline ice particles with cool blue tones
- **Lightning** ⚡ - Chaotic electric bolts with zigzag movement
- **God Particles** 👑 - Divine golden energy with spiral motion
- **Bubbles** 🫧 - Floating bubbles that rise and drift
- **Fireflies** ✨ - Gentle glowing particles that pulse and drift

### 🎵 Audio System
- **Dynamic Sound Effects** - Each particle type has unique audio
- **Ambient Music Support** - Auto-detects your music files
- **Multiple Format Support** - MP3, WAV, OGG, M4A, FLAC
- **Music Controls** - Play/pause, next/previous track
- **Volume Control** - Mute/unmute all audio

### 🎯 Interactive Physics
- **Surfing Fire Effect** - Fire particles follow cursor with momentum
- **Rolling Ball Physics** - Smooth particle generation based on movement
- **Touch & Mouse Support** - Works on desktop and mobile
- **Particle Intensity** - Responds to drawing speed
- **Real-time Animation** - 60fps particle systems

### 🌟 Visual Design
- **Animated Starfield Background** - Dynamic moving stars
- **Gradient UI** - Modern glass morphism design
- **Particle Trails** - Beautiful fading particle effects
- **Responsive Layout** - Works on all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fire-drawing-effect.git
cd fire-drawing-effect
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎵 Adding Your Music

1. **Navigate to the audio folder**
```
public/audio/ambient/
```

2. **Add your music files** (any filename works!)
- `my-favorite-ambient.wav`
- `peaceful-sounds.mp3`
- `nature-atmosphere.ogg`

3. **Refresh the webpage** - Your files will automatically appear in the music controls!

### Supported Audio Formats
- `.mp3` (most compatible)
- `.wav` (high quality)
- `.ogg` (good compression)
- `.m4a` (Apple format)
- `.flac` (lossless)

## 🎮 How to Use

1. **Select an Effect** - Choose from Fire, Ice, Lightning, God Particles, Bubbles, or Fireflies
2. **Start Drawing** - Click and drag (desktop) or touch and drag (mobile)
3. **Try Different Speeds** - Fast movements create more intense effects
4. **Enable Audio** - Click the music button to start ambient background music
5. **Experiment** - Each effect has unique physics and visual properties

### Special Features
- **Fire Surfing** 🏄‍♂️ - Fire particles flow in the direction you move your cursor
- **Lightning Chaos** ⚡ - Random zigzag patterns for electric effects
- **Bubble Physics** 🫧 - Bubbles naturally float upward
- **God Particle Spirals** 👑 - Divine energy swirls in spiral patterns

## 🛠 Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Audio**: Web Audio API + HTML5 Audio
- **Canvas**: HTML5 Canvas with requestAnimationFrame
- **Icons**: Lucide React

## 🏗 Project Structure

```
├── app/
│   ├── api/audio-files/     # Audio file detection API
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # App layout
│   └── page.tsx             # Main page
├── components/ui/           # UI components
├── public/audio/ambient/    # 🎵 Place your music here!
├── drawing-canvas.tsx       # Main drawing component
└── README.md
```

## 🎨 Customization

### Adding New Effects
1. Add new effect type to `EffectType` union
2. Implement particle behavior in `animate()` function
3. Add sound generation in `playSound()` function
4. Create UI button with appropriate icon

### Modifying Physics
- Adjust `getDragProperties()` for different feel
- Modify particle creation in `createParticles()`
- Update movement physics in the animation loop

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload the 'out' folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by digital art and particle systems
- Audio system supports user-provided ambient music
- Designed for creative expression and relaxation

---

**Enjoy creating beautiful fire effects!** 🔥✨

For questions or support, please open an issue on GitHub. 