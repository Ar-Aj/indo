# PaintViz - AI-Powered Paint Visualization App

A modern, responsive paint visualization web application built with Vite + React, optimized for Capacitor mobile deployment to App Store and Play Store.

## ✨ Features

- **AI Visualization**: Upload wall photos and see realistic paint color previews
- **2500+ Colors**: Extensive collection of premium paint colors with search and filtering
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Dark/Light Theme**: Professional high-contrast theme with accessibility support
- **Project Management**: Save and share paint visualization projects
- **Touch-Friendly**: Optimized for mobile interactions with 44px minimum tap targets

## 🛠 Tech Stack

### Frontend
- **Vite + React 18** - Fast development and optimized builds
- **TailwindCSS** - Utility-first styling with custom theme
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form validation
- **Lucide React** - Modern icon library

### Mobile
- **Capacitor.js** - Web-to-mobile wrapper for iOS and Android

### Backend (Planned)
- **Node.js + Express** - API server
- **MongoDB + Mongoose** - Database with schema validation
- **JWT** - Authentication
- **Multer** - File uploads

## 🎨 Design System

### Color Theme
The app uses a professional dark-first theme with excellent contrast ratios (WCAG AA compliant):

```css
:root {
  --primary-bg: #0F0F23;        /* Deep navy background */
  --secondary-bg: #1A1A2E;      /* Lighter navy surfaces */
  --accent-bg: #16213E;         /* Card/modal backgrounds */
  --primary-text: #EEEEF0;      /* Off-white text */
  --secondary-text: #B8B8CC;    /* Muted text */
  --accent-color: #4F46E5;      /* Indigo primary button */
  --success-color: #10B981;     /* Green success states */
  --warning-color: #F59E0B;     /* Amber warnings */
  --border-color: #374151;      /* Subtle borders */
  --hover-bg: #374151;          /* Hover states */
}
```

## 📱 Pages & Features

1. **Home Page (/)** - Hero section, features grid, CTAs
2. **About Us (/about)** - Company story, team, sustainability
3. **Contact (/contact)** - Contact form with validation, FAQ
4. **Paint Your Wall (/paint-your-wall)** - Main visualization tool
5. **Authentication (/login, /register)** - User accounts and auth

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- For mobile development: Xcode (iOS) and/or Android Studio

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd paint-app
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

## 📱 Mobile Development

### Setup Capacitor

1. **Add mobile platforms:**
```bash
# iOS
npm run cap:add:ios

# Android
npm run cap:add:android
```

2. **Sync web assets:**
```bash
npm run cap:sync
```

### Development

1. **Run on device/simulator:**
```bash
# iOS
npm run cap:run:ios

# Android
npm run cap:run:android
```

2. **Open in native IDE:**
```bash
# iOS (Xcode)
npm run cap:open:ios

# Android (Android Studio)
npm run cap:open:android
```

### Production Builds

1. **Build for App Store/Play Store:**
```bash
# iOS
npm run cap:build:ios

# Android
npm run cap:build:android
```

## 🏗 Project Structure

```
paint-app/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Header, Footer, Navigation
│   │   ├── forms/           # Form components
│   │   └── paint/           # Paint-specific components
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── PaintYourWall.jsx
│   │   └── auth/            # Authentication pages
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── utils/
│   │   ├── api.js
│   │   └── colorUtils.js
│   └── styles/
│       └── globals.css
├── capacitor.config.ts      # Capacitor configuration
├── tailwind.config.js       # TailwindCSS configuration
└── vite.config.js          # Vite configuration
```

## 🎯 Key Components

### UI Components
- **Button** - Multiple variants and sizes with accessibility
- **Input** - Form inputs with validation states
- **Card** - Content containers with header/footer
- **Modal** - Accessible modal dialogs

### Paint Components
- **ImageUpload** - Drag-and-drop file upload with validation
- **ColorGrid** - Searchable, filterable color selection
- **ColorPicker** - Individual color selection component

## 🔧 Development Features

### Theme System
- Dark/light mode toggle with localStorage persistence
- CSS custom properties for consistent theming
- System preference detection

### Form Validation
- React Hook Form integration
- Real-time validation feedback
- Accessible error messages

### Mobile Optimization
- Touch-friendly interactions (44px minimum)
- Responsive breakpoints
- Native-feeling animations
- Capacitor-ready configuration

## 📦 Build & Deployment

### Web Deployment
```bash
# Build static files
npm run build

# Preview build locally
npm run preview
```

### Mobile App Store Deployment

#### iOS App Store
1. Build the app: `npm run cap:build:ios`
2. Open Xcode: `npm run cap:open:ios`
3. Configure signing certificates
4. Archive and upload to App Store Connect

#### Google Play Store
1. Build the app: `npm run cap:build:android`
2. Open Android Studio: `npm run cap:open:android`
3. Generate signed APK/AAB
4. Upload to Google Play Console

## 🧪 Testing

### Manual Testing Checklist
- [ ] All pages load correctly
- [ ] Theme toggle works
- [ ] Forms validate properly
- [ ] Image upload functions
- [ ] Color selection works
- [ ] Mobile responsiveness
- [ ] Touch interactions

### Mobile Testing
- [ ] iOS simulator/device
- [ ] Android emulator/device
- [ ] Portrait/landscape orientations
- [ ] Various screen sizes
- [ ] Native navigation

## 🔮 Future Enhancements

### Planned Features
- [ ] Backend API integration
- [ ] User authentication system
- [ ] Project saving/loading
- [ ] Social sharing
- [ ] Camera integration for live preview
- [ ] AR visualization
- [ ] Paint calculator
- [ ] Color matching tools

### Technical Improvements
- [ ] Unit testing setup
- [ ] E2E testing
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Analytics integration
- [ ] PWA features
- [ ] Offline support

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

Please read our contributing guidelines and code of conduct before submitting pull requests.

## 📞 Support

For technical support or questions:
- Email: support@paintviz.com
- Documentation: [docs.paintviz.com](https://docs.paintviz.com)
- Issues: GitHub Issues tab

---

**PaintViz** - Transform your space with confidence. 🎨
