# Foundrly

**Because every bad founder needs company.**

Foundrly is a Tinder-style app for bad startup ideas where users swipe idea cards, match with people who liked the same idea, and chat in real-time. Includes an AI-powered idea generator, meme feed, and all the hooks needed to iterate further.

## 🚀 Features

- **OAuth Authentication** - Sign in with Google, GitHub, or use mock login for local dev
- **Tinder-style Swipe UI** - Swipe through bad startup ideas with smooth animations
- **Matching System** - Match with users who liked the same idea, or automatically match when someone likes your idea
- **Real-time Chat** - Socket.io-powered chat for matched users
- **AI Idea Generator** - OpenAI/Gemini integration to generate hilariously bad startup ideas
- **Meme Feed** - Submit and upvote memes about bad startup ideas
- **User Profiles** - Customize your profile with role, bio, and avatar

## 📁 Project Structure

```
foundrly/
├── backend/          # Express.js backend API
│   ├── models/       # MongoDB models (User, Idea, Match, Swipe, Message, Meme)
│   ├── routes/       # API routes (auth, users, ideas, matches, chat, ai, memes)
│   ├── middleware/   # Auth middleware
│   ├── socket/       # Socket.io handlers
│   ├── server.js     # Express server entry point
│   └── package.json
├── frontend/         # React frontend
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # Reusable components
│   │   ├── contexts/ # React contexts (Auth, Toast)
│   │   └── api/      # API client
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend

- **Express.js** - Node.js web framework
- **MongoDB** - Database with Mongoose
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **OpenAI/Gemini** - AI idea generation

### Frontend

- **React** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Socket.io Client** - Real-time chat

## 📦 Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):

```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/foundrly
JWT_SECRET=changeme
SESSION_SECRET=changeme
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OPENAI_API_KEY=
GEMINI_API_KEY=
FRONTEND_URL=http://localhost:3000
```

4. Start MongoDB (if running locally):

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud)
```

5. Seed the database:

```bash
npm run seed
```

6. Start the backend:

```bash
npm run start:dev
```

The backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file (optional, defaults are set):

```bash
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

4. Start the frontend:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🌐 API Endpoints

### Auth

- `GET /auth/google` - Google OAuth
- `GET /auth/github` - GitHub OAuth
- `POST /auth/mock` - Mock login (for local dev)
- `GET /auth/me` - Get current user

### Ideas

- `GET /api/ideas` - List ideas
- `GET /api/ideas/:id` - Get idea by ID
- `POST /api/ideas` - Submit new idea

### Matches

- `POST /api/match/swipe` - Swipe on an idea (creates matches when: two users like the same idea, or when someone likes your idea)
- `GET /api/match/matches` - Get user matches
- `GET /api/match/matches/:id` - Get match by ID

### Chat

- `GET /api/chat/:matchId/messages` - Get chat messages
- Socket.io events: `join`, `message`, `typing`, `match_notification`

### Memes

- `GET /api/memes` - List memes
- `POST /api/memes` - Submit meme
- `POST /api/memes/:id/upvote` - Upvote meme

### AI

- `POST /api/ai/generate` - Generate ideas
- `POST /api/ai/generate-and-save` - Generate and save ideas
- `POST /api/ai/pitchpolish` - Polish an idea pitch

## 🐳 Docker

### Backend Dockerfile

```bash
cd backend
docker build -t foundrly-backend .
docker run -p 4000:4000 foundrly-backend
```

## 🚢 Deployment

### Backend (Render/Heroku)

1. Set environment variables in your hosting platform
2. Deploy using the Dockerfile or connect to your Git repo
3. Ensure MongoDB Atlas is configured

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables:
   - `VITE_API_BASE_URL` - Your backend URL
   - `VITE_SOCKET_URL` - Your backend URL

## 🔑 Environment Variables

### Backend (.env)

- `PORT` - Server port (default: 4000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `OPENAI_API_KEY` - OpenAI API key (optional, uses mock if not set)
- `GEMINI_API_KEY` - Google Gemini API key (optional)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env)

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

## 🎯 Usage

1. **Sign In**: Use OAuth or mock login
2. **Swipe**: Swipe right on ideas you like, left to pass
3. **Match**:
   - When two users like the same idea, they match!
   - When someone likes your idea, you automatically match with them
4. **Chat**: Real-time chat with your matches
5. **Feed**: Browse and submit memes
6. **Profile**: Customize your founder profile and view your submitted ideas

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running locally or use MongoDB Atlas
- Check `MONGO_URI` in `.env`

### OAuth Not Working

- Use mock login for local development
- Ensure OAuth credentials are set in `.env`
- Check callback URLs match your setup

### AI Generation Not Working

- AI features will use mock data if API keys are not set
- Set `OPENAI_API_KEY` or `GEMINI_API_KEY` in `.env`

## 📝 License

MIT

## 🙏 Acknowledgments

Built for hackathons and bad startup ideas everywhere.
