<p align="center">
  <img src="https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
</p>

<h1 align="center">📔 My Diary</h1>

<p align="center">
  <b>A fully video-coded, premium, end-to-end encrypted daily diary application.</b><br/>
  Every single line of this app was written live on video — no shortcuts, no copy-paste.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/contributions-welcome-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/PRs-welcome-ff69b4?style=flat-square" />
</p>

---

> 🎬 **This is a fully video-coded application!**  
> The entire development process — from architecture design to final polish — was recorded and coded live on video. Want to understand _how_ and _why_ every decision was made? Watch the build series!

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **AES-256-GCM Encryption** | Your diary entries are encrypted before they ever leave your device |
| 📅 **Calendar View** | Beautiful interactive calendar to browse past entries |
| 📝 **Rich Text Editor** | Full rich-text formatting with Flutter Quill |
| 🖼️ **Image Attachments** | Attach photos from camera or gallery, stored on Cloudinary |
| 🌙 **Premium Dark Theme** | Stunning dark UI with glassmorphism and smooth animations |
| 🔔 **Daily Reminders** | Gentle 10 PM notification reminding you to journal |
| 🔑 **JWT Authentication** | Secure access & refresh token based auth |
| 📱 **Cross-Platform** | Runs on Android & iOS |

---

## 🏗️ Architecture

```
my_diary/
├── lib/                        # Flutter App (Frontend)
│   ├── config/                 # Theme, API config
│   ├── providers/              # State management (Provider)
│   ├── screens/                # All app screens
│   ├── services/               # API, Auth, Diary, Notification services
│   ├── widgets/                # Reusable UI components
│   └── main.dart               # App entry point
│
├── backend_server/             # Node.js + TypeScript (Backend)
│   ├── src/
│   │   ├── config/             # Environment & Cloudinary config
│   │   ├── contexts/           # MCP Context layer (business logic)
│   │   ├── middleware/         # Auth middleware, file upload
│   │   ├── models/             # Prisma client
│   │   ├── protocols/          # MCP Protocol layer (controllers)
│   │   └── routes/             # Express route definitions
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── .env                    # Environment variables (see below)
│
└── android/                    # Android platform config
```

**Backend follows MCP (Model-Context-Protocol) Architecture:**
- **Model** → Prisma ORM + PostgreSQL
- **Context** → Business logic layer (encryption, validation, Cloudinary)
- **Protocol** → HTTP controllers that talk to contexts

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Flutter SDK | `>= 3.11.x` |
| Node.js | `>= 18.x` |
| npm | `>= 9.x` |
| PostgreSQL | `>= 14.x` (or use [Neon](https://neon.tech) serverless) |
| Cloudinary Account | Free tier works fine |

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Arman-Shaikh58/Diary_App.git
cd Diary_App
```

---

### 2️⃣ Backend Setup

#### Create the `.env` file

Inside the `backend_server/` directory, create a `.env` file with the following variables:

```bash
cd backend_server
touch .env
```

```env
# ─── Server ──────────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ─── PostgreSQL (Prisma) ─────────────────────────────────
# Replace with your own PostgreSQL connection string
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

# ─── JWT Secrets ─────────────────────────────────────────
# Generate a strong random string (64+ hex chars recommended)
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

# ─── Cloudinary ──────────────────────────────────────────
# Get these from https://console.cloudinary.com/settings
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# ─── Limits ──────────────────────────────────────────────
BCRYPT_SALT_ROUNDS=12
MAX_IMAGE_SIZE_MB=10
MAX_IMAGES_PER_ENTRY=10
```

> ⚠️ **Important:** Never commit your `.env` file! It's already in `.gitignore`.

#### Install dependencies & run

```bash
# Install packages
npm install

# Generate Prisma client
npm run prisma:generate

# Push schema to database (first time)
npm run prisma:push

# Start development server
npm run dev
```

The backend will be live at `http://localhost:3000`.

---

### 3️⃣ Flutter App Setup

```bash
# Go back to root directory
cd ..

# Install Flutter dependencies
flutter pub get

# Run on a connected device or emulator
flutter run
```

#### API Base URL

The app's API endpoint is configured in `lib/config/api_config.dart`:

```dart
class ApiConfig {
  // For production (deployed backend):
  static const String baseUrl = "https://your-backend-url.com/api/v1";

  // For local development with Android emulator:
  // static const String baseUrl = "http://10.0.2.2:3000/api/v1";

  // For local development with physical device:
  // static const String baseUrl = "http://YOUR_LOCAL_IP:3000/api/v1";
}
```

---

### 4️⃣ Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Server port (default: `3000`) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `JWT_ACCESS_EXPIRES` | ✅ | Access token expiry (e.g., `15m`) |
| `JWT_REFRESH_EXPIRES` | ✅ | Refresh token expiry (e.g., `7d`) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Your Cloudinary API secret |
| `BCRYPT_SALT_ROUNDS` | ❌ | Password hashing rounds (default: `12`) |
| `MAX_IMAGE_SIZE_MB` | ❌ | Max upload size per image (default: `10`) |
| `MAX_IMAGES_PER_ENTRY` | ❌ | Max images per diary entry (default: `10`) |

---

## 🔔 Daily Notifications

The app sends a gentle reminder every day at **10:00 PM** with one of these rotating messages:

- 📝 *"How was your day?"*
- ✨ *"Take a moment to reflect on today"*
- 🌙 *"Your diary is waiting for you"*
- 💭 *"Write down your thoughts before bed"*
- 📖 *"Capture today's memories before they fade"*
- 🌟 *"A few words today, a treasure tomorrow"*

Notifications are scheduled locally — no server needed. They persist across device reboots.

---

## 🤝 Contributing

**Contributions are welcome and encouraged!** 🎉

This is an open-source project and we'd love your help to make it even better.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Ideas

- 🎨 New themes (light mode, AMOLED black, custom colors)
- 🔍 Search functionality across diary entries
- 📊 Mood analytics & charts
- 🏷️ Tags and categories for entries
- 📤 Export diary entries as PDF
- 🌐 Localization / multi-language support
- 🧪 Unit & integration tests
- 📱 iOS-specific optimizations

### Guidelines

- Follow the existing code style and architecture patterns
- Write meaningful commit messages (we follow [Conventional Commits](https://www.conventionalcommits.org/))
- Test your changes on at least one platform before submitting
- Update documentation if needed

---

## 🛡️ Security

- All diary content is encrypted with **AES-256-GCM** before being stored
- Passwords are hashed with **bcrypt** (12 rounds)
- Authentication uses **JWT** with access + refresh token rotation
- Encryption keys are unique per user
- Images are stored securely on **Cloudinary**

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ and coded live on video<br/>
  <b>Star ⭐ the repo if you find it useful!</b>
</p>
