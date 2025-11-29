# CineNetwork 🎬

CineNetwork is a premium OTT (Over-The-Top) streaming application built with React Native and Node.js. It offers a seamless viewing experience with advanced video player features, secure authentication, and a modern, dynamic UI.

## 🚀 Features

### 📱 Frontend (Mobile App)

- **Premium UI/UX**: Dark mode aesthetic, glassmorphism effects, and smooth animations using `react-native-reanimated`.
- **Advanced Video Player**:
  - **Resume Playback**: Continues video from where you left off.
  - **Custom Controls**: Play/Pause, Seek, Fullscreen toggle.
  - **Gesture Controls**: Double-tap to seek (forward/backward 10s).
  - **Quality Selector**: Support for multiple resolutions (Auto, 360p, 480p, 720p, 1080p, 4k).
  - **Playback Speed**: Adjustable speed (0.5x - 2.0x).
- **Authentication**: Secure OTP-based login and signup flow.
- **Home Screen**: Dynamic hero slider, trending content, and categorized lists.
- **Shorts**: Vertical short-form video feed (Reels/Shorts style).

### 🔙 Backend (API)

- **Node.js & Express**: Robust REST API architecture.
- **Database**: PostgreSQL for managing users, content, and watch history.
- **Authentication**: JWT-based session management.
- **Content Management**: APIs for fetching movies, series, and metadata.

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo, TypeScript, Expo Router, Expo AV / Video Player.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL.
- **Tools**: Git, VS Code.

## 📦 Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/Asish372/CineNetwork.git
    cd CineNetwork
    ```

2.  **Frontend Setup**:

    ```bash
    cd frontend
    npm install
    npx expo start
    ```

3.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
