# Qonvoo Frontend 🌟

Modern, responsive frontend for Qonvoo - a real-time chat application where users can connect with strangers worldwide. Built with Next.js, TailwindCSS, and Socket.IO.

## ✨ Features

### 🎨 **Modern UI/UX**
- **Glassmorphism/Neumorphism** design with smooth animations
- **Dark/Light mode** toggle with animated sparkles
- **Fully responsive** - works on desktop, tablet, and mobile
- **Beautiful gradients** and modern typography

### 💬 **Real-time Chat**
- **Instant messaging** with Socket.IO
- **Live user matching** - connect with strangers instantly
- **Skip functionality** - find new partners anytime
- **Live user counter** - see how many people are online
- **Auto-reconnect** with countdown timer

### 📱 **Media Sharing**
- **Image uploads** - Share photos securely via Cloudinary
- **Audio recording** - Record and send voice messages
- **Emoji picker** - Express yourself with emojis
- **Video/Audio calls** - WebRTC peer-to-peer communication

### 📊 **Analytics Dashboard**
- **Live statistics** - Real-time user metrics
- **Call tracking** - Video/audio call analytics
- **Media uploads** - File sharing statistics
- **Server health** - Uptime and performance

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TailwindCSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **PeerJS** - WebRTC peer-to-peer calls
- **Cloudinary** - Media upload and storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Cloudinary account (free)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ayush68824/Qonv-front.git
cd Qonv-front
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=QONVOO
NEXT_PUBLIC_BACKEND_URL=https://qonv-back.onrender.com
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🎯 Key Features Explained

### Real-time Chat Flow
1. User enters username → connects to Socket.IO
2. Server matches with waiting user instantly
3. Both users can send text/media messages
4. Skip button finds new partner automatically
5. Disconnection triggers auto-reconnect

### Media Upload Security
1. **Frontend validation** - File type and size check
2. **Backend validation** - Additional security checks
3. **Cloudinary upload** - Secure cloud storage
4. **Virus scanning** - AWS Rekognition integration
5. **URL sharing** - Only secure URLs sent via chat

### WebRTC Video Calls
- **Peer-to-peer** - Direct connection (no server relay)
- **Video/Audio calls** - High-quality communication
- **STUN servers** - NAT traversal for global connectivity
- **Call controls** - Accept, decline, end calls
- **Call duration** - Real-time timer

## 📱 User Experience

- **No registration** - Just enter username and start
- **Instant matching** - No waiting, immediate connections
- **Skip anytime** - Find new partners instantly
- **Beautiful UI** - Modern design with animations
- **Mobile friendly** - Works perfectly on all devices

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Netlify
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `out`
4. Set environment variables

### Manual Build
```bash
npm run build
npm start
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Yes |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | Yes |
| `NEXT_PUBLIC_BACKEND_URL` | Backend server URL | Yes |

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.js            # Login page
│   ├── chat/              # Chat interface
│   │   └── page.js        # Main chat page
│   ├── layout.js          # Root layout
│   └── globals.css        # Global styles
├── public/                # Static assets
├── package.json           # Dependencies
└── README.md             # Documentation
```

## 🎨 Design Features

### Glassmorphism
- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders and shadows
- Modern, elegant appearance

### Dark/Light Mode
- Automatic theme switching
- Animated sparkles in dark mode
- Smooth transitions
- Consistent color schemes

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces
- Adaptive layouts

## 🔒 Security Features

- **Input sanitization** - XSS protection
- **File validation** - Type and size checks
- **Secure uploads** - Cloudinary integration
- **CORS protection** - Cross-origin security
- **Rate limiting** - Backend protection

## 📊 Analytics Integration

- **Real-time stats** - Live user metrics
- **Call analytics** - Video/audio call tracking
- **Media uploads** - File sharing statistics
- **User sessions** - Connection tracking
- **Performance monitoring** - Server health

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Search existing issues
3. Create new issue with details

## 🔗 Links

- **Backend Repository:** [https://github.com/ayush68824/Qonv-back](https://github.com/ayush68824/Qonv-back)
- **Live Backend:** [https://qonv-back.onrender.com](https://qonv-back.onrender.com)
- **Cloudinary:** [https://cloudinary.com](https://cloudinary.com)

---

**Built with ❤️ for connecting people worldwide**
