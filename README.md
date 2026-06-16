# 🌌 Freckles Constellations

Discover the celestial map hidden on your skin. Upload or capture a photo of your face, and watch as the cosmos traces a glowing, interactive constellation directly from your freckles, complete with custom astrological charts, dynamic matching scores, and downloadable posters.

---

## ✨ Features

*   **📷 Cosmic Facemap Capture:** Upload or snap a live photo using your camera to identify unique star nodes based on natural beauty marks and freckles.
*   **🪐 Interactive 2D & 3D Celestial Workspace:** Hover, rotate, styling, and configure customized star linkages on an immersive dark canvas.
*   **💫 Zodiac Convergence Matching:** Compare your personal facial map with twelve traditional astronomical archetypes to compute custom alignment ratios and view astrological blurbs.
*   **🎨 Liquid Crystal Overlay Controls:** Enjoy an elegant, minimalist control tray including a custom fluid visual toggle and an selection selector.
*   **🔔 Ambient Star soundscape:** Fully synthesized acoustic micro-feedbacks during selection, configuration editing, and toggle adjustments.
*   **🔒 Secure Firebase Persistence:** Dynamic session management allowing users to sign in, save personalized constellation designs, customized star styles, and keep logs.
*   **🖨️ Celestial Posters:** Share your cosmic alignment with beautiful downloadable charts.

---

## 🛠️ Security & Safe Configuration

In alignment with production-ready guidelines, all sensitive configurations have been completely scrubbed from repository indexation and placed in secondary environment files. This ensures your Firebase API credentials and secrets remain strictly confidential.

To connect your own Firebase environment, declare the variables listed below inside your custom `.env` or system environment settings:

```env
# Server Secrets (Not exposed to client)
GEMINI_API_KEY="your_gemini_api_key_here"

# Client-Facing Firebase Environment Variables
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Run npm to install required modules:
```bash
npm install
```

### 2. Enter Development Mode
To start the standard integrated full-stack server running TypeScript on Express:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to trace your stars.

### 3. Build & Production Start
Compile assets using Vite & bundle the server with native esbuild:
```bash
npm run build
npm start
```

---

## 🎨 Design Language

*   **Typography:** Elegant *Space Grotesk* for technical headings matched with high-readability *Inter* body elements and *JetBrains Mono* for precise telemetry values.
*   **Aesthetic Theme:** Dark Slate Cosmic. Generous negative space, delicate glowing boundaries, and high-contrast blue/cyan/amber focal accents that evoke high-end starry chart tables.
