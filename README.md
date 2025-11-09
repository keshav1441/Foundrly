# Foundrly

**Swipe Right on Bad Startup Ideas**

Foundrly is a Netflix-inspired swipe-based matching app for founders with terrible startup ideas. Swipe through ideas, send requests to idea creators, match when requests are accepted, and chat in real-time. Includes an AI-powered idea generator, meme feed, and a cinematic dark theme.

## 🚀 Features

- **JWT Authentication** - Sign in with email/password or Google OAuth
- **Tinder-Style Swipe UI** - Cinematic card-based swipe interface with smooth animations
- **Request System** - Send messages to idea creators when you swipe right on their ideas
- **Matching System** - Match when idea creators accept your request
- **Real-time Chat** - Socket.io-powered chat with split-screen UI (matches list + active chat)
- **Notifications System** - Real-time notifications for incoming requests and messages with mark-as-read functionality
- **AI Idea Generator** - OpenAI/Gemini integration to generate hilariously bad startup ideas
- **Feed** - Submit and upvote posts with title and description
- **User Profiles** - Netflix-style profile pages with idea carousels
- **Responsive Design** - Works on mobile, tablet, and desktop

## 📁 Project Structure

```
foundrly/
├── backend/          # Express.js backend API
│   ├── models/       # MongoDB models (User, Idea, Match, Swipe, Message, Meme, Request, Comment)
│   ├── routes/       # API routes (auth, users, ideas, matches, chat, ai, memes, requests, notifications)
│   ├── middleware/   # Auth middleware
│   ├── socket/       # Socket.io handlers
│   ├── scripts/     # Utility scripts (clearData.js)
│   ├── server.js     # Express server entry point
│   └── package.json
├── frontend/         # React frontend
│   ├── src/
│   │   ├── pages/    # Page components (Marketing, Home, SwipePage, Chat, Feed, Profile, Requests)
│   │   ├── components/ # Reusable components (SwipeDeck, Navbar, RequestMessageModal, Notifications, etc.)
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
- **JWT** - Authentication with bcrypt password hashing
- **OpenAI/Gemini** - AI idea generation

### Frontend

- **React** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling with Netflix-inspired dark theme
- **Framer Motion** - Smooth animations
- **Socket.io Client** - Real-time chat
- **React Router** - Navigation

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

3. Create `.env` file:

```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/foundrly
JWT_SECRET=changeme_dev_secret_key_12345
SESSION_SECRET=changeme_dev_session_secret_12345
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

4. Start MongoDB (if running locally):

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud)
```

5. Start the backend:

```bash
npm run dev
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
```

4. Start the frontend:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🎮 Usage

1. **Sign Up/In**:

   - Create an account with email/password
   - Or sign in with Google OAuth
   - Or use the mock login for quick testing

2. **Swipe Ideas**:

   - Swipe right (✓) on ideas you like
   - Swipe left (✕) to pass
   - When you swipe right on someone else's idea, a modal appears to send a request message

3. **Send Requests**:

   - When you swipe right on an idea, enter a message to the idea creator
   - The idea creator will see your request on the Requests page

4. **Accept Requests**:

   - View pending requests on the Requests page
   - Accept or reject requests
   - When accepted, you both match and can chat

5. **Chat**:

   - Real-time chat with your matches
   - Split-screen UI: matches list on left, active chat on right
   - Messages are organized by idea

6. **Notifications**:

   - Real-time notifications for incoming requests and messages
   - Click the bell icon in the navbar to view notifications
   - Mark individual notifications as read or mark all as read
   - Only unread notifications are displayed

7. **Feed**:

   - Browse memes (randomized order)
   - Submit memes with title and description
   - Upvote and comment on memes

8. **Profile**:
   - View your profile or other users' profiles
   - See ideas you've worked on in a carousel
   - Edit your own profile

## 🌐 API Endpoints

### Auth

- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/mock` - Mock login for quick testing
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback handler
- `GET /api/auth/me` - Get current authenticated user

### Users

- `GET /api/users/me` - Get current user (requires authentication)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (requires authentication, can only update own profile)

### Ideas

- `GET /api/ideas` - List ideas (excludes user's own and already-swiped if authenticated)
  - Query params: `trending` (true/false), `limit` (number)
- `GET /api/ideas/:id` - Get idea by ID
- `GET /api/ideas/user/:userId` - Get all ideas by a specific user
- `POST /api/ideas` - Submit new idea (requires authentication)
- `PUT /api/ideas/:id` - Update idea (requires authentication)
- `DELETE /api/ideas/:id` - Delete idea (requires authentication)

### Swipes & Matches

- `POST /api/match/swipe` - Swipe on an idea (requires authentication)
  - Body: `{ ideaId, direction: "left" | "right" }`
  - Returns: `{ needsRequest: true, ideaId }` if idea belongs to someone else, or match data
- `GET /api/match/matches` - Get user matches with last message and sorting (requires authentication)
- `GET /api/match/matches/:id` - Get match by ID (requires authentication)

### Requests

- `POST /api/requests` - Create a request (send message to idea creator, requires authentication)
  - Body: `{ ideaId, message }`
- `GET /api/requests` - Get requests (received and sent, requires authentication)
- `POST /api/requests/:id/accept` - Accept request and create match (requires authentication)
- `POST /api/requests/:id/reject` - Reject request (requires authentication)

### Notifications

- `GET /api/notifications` - Get all unread notifications (requests + messages, requires authentication)
  - Returns only unread requests (`viewed: false`) and unread messages (`read: false`)
- `POST /api/notifications/:id/read` - Mark a notification as read (requires authentication)
  - Body: `{ type: "request" | "message" }`
- `POST /api/notifications/read-all` - Mark all notifications as read (requires authentication)
- Socket.io events: `new_request_notification`, `new_message_notification`

### Chat

- `GET /api/chat/:matchId/messages` - Get chat messages for a match (requires authentication)
- `POST /api/chat/:matchId/messages` - Send message in a match (requires authentication)
  - Body: `{ content }`
- `POST /api/chat/:matchId/messages/read` - Mark all messages in a match as read (requires authentication)
- Socket.io namespace: `/chat`
- Socket.io events: `join`, `message`, `joined`, `match_notification`

### Memes

- `GET /api/memes` - List memes (sorted by upvotes, most recent first)
  - Query params: `limit` (number)
- `POST /api/memes` - Submit meme with title and description (requires authentication)
- `POST /api/memes/:id/upvote` - Upvote a meme (requires authentication)
- `GET /api/memes/:id/comments` - Get comments for a meme
- `POST /api/memes/:id/comments` - Add comment to a meme (requires authentication)

### AI

- `POST /api/ai/generate-and-save` - Generate ideas as editable templates (requires authentication and API keys)
  - Body: `{ count: number }` (default: 1)
  - Returns ideas for user to edit before saving

## 🔧 Scripts

### Backend

- `npm start` - Start production server
- `npm run dev` - Start development server with watch mode
- `npm run clear-data` - Clear all ideas, matches, swipes, messages, and requests from database

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests

## 🔑 Environment Variables

### Backend (.env)

- `PORT` - Server port (default: 4000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `OPENAI_API_KEY` - OpenAI API key (required for AI features)
- `GEMINI_API_KEY` - Google Gemini API key (required for AI features)
- `FRONTEND_URL` - Frontend URL for CORS
- `BACKEND_URL` - Backend URL

### Frontend (.env)

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:4000/api)

## 🎨 Design

- **Netflix-inspired dark theme** with red accents
- **Glassmorphism effects** on cards and modals
- **Cinematic hero sections** on marketing and profile pages
- **Smooth animations** with Framer Motion
- **Responsive design** for all screen sizes
- **Custom color palette**: Netflix red, dark gradients, card backgrounds

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running locally or use MongoDB Atlas
- Check `MONGO_URI` in `.env`

### Authentication Issues

- Clear browser localStorage if tokens are corrupted
- Check JWT_SECRET is set in backend `.env`
- Verify password hashing with bcrypt

### Socket.io Not Working

- Check backend console for connection logs
- Verify token is being sent in Socket.io auth
- Check browser console for Socket.io errors
- Ensure backend Socket.io CORS is configured

### Modal Not Appearing

- Check browser console for debug logs
- Verify `needsRequest: true` in API response
- Check modal z-index (should be z-[9999])
- Ensure idea has a `submittedBy` field

### AI Generation Not Working

- AI features require API keys to be set
- Set `OPENAI_API_KEY` or `GEMINI_API_KEY` in `.env`
- Check backend logs for API errors

## 📝 License

MIT
